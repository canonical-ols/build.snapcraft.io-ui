import { createHash } from 'crypto';

import yaml from 'js-yaml';
import parseGitHubUrl from 'parse-github-url';

import { conf } from '../helpers/config';
import { getMemcached } from '../helpers/memcached';
import requestGitHub from '../helpers/github';
import getLaunchpad from '../launchpad';
import logging from '../logging';

const logger = logging.getLogger('express-error');

// XXX cjwatson 2016-12-08: Hardcoded for now, but should eventually be
// configurable.
const DISTRIBUTION = 'ubuntu';
const DISTRO_SERIES = 'xenial';
const ARCHITECTURES = ['amd64', 'armhf'];
const STORE_SERIES = '16';
const STORE_CHANNELS = ['edge'];

const RESPONSE_NOT_LOGGED_IN = {
  status: 'error',
  payload: {
    code: 'not-logged-in',
    message: 'Not logged in'
  }
};

const RESPONSE_GITHUB_BAD_URL = {
  status: 'error',
  payload: {
    code: 'github-bad-url',
    message: 'Cannot parse GitHub URL'
  }
};

const RESPONSE_GITHUB_NO_ADMIN_PERMISSIONS = {
  status: 'error',
  payload: {
    code: 'github-no-admin-permissions',
    message: 'You do not have admin permissions for this GitHub repository'
  }
};

const RESPONSE_GITHUB_NOT_FOUND = {
  status: 'error',
  payload: {
    code: 'github-snapcraft-yaml-not-found',
    message: 'Cannot find snapcraft.yaml in this GitHub repository'
  }
};

const RESPONSE_GITHUB_AUTHENTICATION_FAILED = {
  status: 'error',
  payload: {
    code: 'github-authentication-failed',
    message: 'Authentication with GitHub failed'
  }
};

const RESPONSE_GITHUB_OTHER = {
  status: 'error',
  payload: {
    code: 'github-error-other',
    message: 'Something went wrong when looking for snapcraft.yaml'
  }
};

const RESPONSE_SNAPCRAFT_YAML_PARSE_FAILED = {
  status: 'error',
  payload: {
    code: 'snapcraft-yaml-parse-failed',
    message: 'Failed to parse snapcraft.yaml'
  }
};

const RESPONSE_SNAPCRAFT_YAML_NO_NAME = {
  status: 'error',
  payload: {
    code: 'snapcraft-yaml-no-name',
    message: 'snapcraft.yaml has no top-level "name" attribute'
  }
};

const RESPONSE_SNAP_NAME_NOT_REGISTERED = {
  status: 'error',
  payload: {
    code: 'snap-name-not-registered',
    message: 'Snap name is not registered in the store'
  }
};

const RESPONSE_SNAP_NOT_FOUND = {
  status: 'error',
  payload: {
    code: 'snap-not-found',
    message: 'Cannot find existing snap based on this URL'
  }
};

class PreparedError extends Error {
  constructor(status, body) {
    super();
    this.status = status;
    this.body = body;
  }
}

// Wrap errors in a promise chain so that they always end up as a
// PreparedError.
const prepareError = (error) => {
  if (error.status && error.body) {
    // The error comes with a prepared representation.
    return Promise.resolve(error);
  } else if (error.response) {
    // if it's ResourceError from LP client at least for the moment
    // we just wrap the error we get from LP
    return error.response.text().then((text) => {
      logger.info('Launchpad API error:', text);
      return new PreparedError(error.response.status, {
        status: 'error',
        payload: {
          code: 'lp-error',
          message: text
        }
      });
    });
  } else {
    return Promise.resolve(new PreparedError(500, {
      status: 'error',
      payload: {
        code: 'internal-error',
        message: error.message
      }
    }));
  }
};

const sendError = (res, error) => {
  return prepareError(error)
    .then((preparedError) => {
      res.status(preparedError.status).send(preparedError.body);
    });
};

const checkGitHubStatus = (response) => {
  if (response.statusCode !== 200) {
    let body = response.body;
    if (typeof body !== 'object') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        logger.info('Invalid JSON received', e, body);
        throw new PreparedError(500, RESPONSE_GITHUB_OTHER);
      }
    }
    switch (body.message) {
      case 'Not Found':
        // snapcraft.yaml not found
        throw new PreparedError(404, RESPONSE_GITHUB_NOT_FOUND);
      case 'Bad credentials':
        // Authentication failed
        throw new PreparedError(401, RESPONSE_GITHUB_AUTHENTICATION_FAILED);
      default:
        // Something else
        logger.info('GitHub API error:', response.statusCode, body);
        throw new PreparedError(500, RESPONSE_GITHUB_OTHER);
    }
  }
  return response;
};

const checkAdminPermissions = (session, repositoryUrl) => {
  if (!session || !session.token) {
    return Promise.reject(new PreparedError(401, RESPONSE_NOT_LOGGED_IN));
  }
  const token = session.token;

  const parsed = parseGitHubUrl(repositoryUrl);
  if (parsed === null || parsed.owner === null || parsed.name === null) {
    logger.info(`Cannot parse "${repositoryUrl}"`);
    return Promise.reject(new PreparedError(400, RESPONSE_GITHUB_BAD_URL));
  }

  const uri = `/repos/${parsed.owner}/${parsed.name}`;
  const options = { token, json: true };
  logger.info(`Checking permissions for ${parsed.owner}/${parsed.name}`);
  return requestGitHub.get(uri, options)
    .then(checkGitHubStatus)
    .then((response) => {
      if (!response.body.permissions || !response.body.permissions.admin) {
        throw new PreparedError(401, RESPONSE_GITHUB_NO_ADMIN_PERMISSIONS);
      }
      return { owner: parsed.owner, name: parsed.name, token };
    });
};

const makeSnapName = (url) => {
  return createHash('md5').update(url).digest('hex');
};

const getSnapcraftYaml = (owner, name, token) => {
  const uri = `/repos/${owner}/${name}/contents/snapcraft.yaml`;
  const options = {
    token,
    headers: { 'Accept': 'application/vnd.github.v3.raw' }
  };
  logger.info(`Fetching snapcraft.yaml from ${owner}/${name}`);
  return requestGitHub.get(uri, options)
    .then(checkGitHubStatus)
    .then((response) => {
      try {
        return yaml.safeLoad(response.body);
      } catch (e) {
        throw new PreparedError(400, RESPONSE_SNAPCRAFT_YAML_PARSE_FAILED);
      }
    });
};

const verifySnapNameRegistered = (name) => {
  const MACAROON_API_URL = 'https://myapps.developer.ubuntu.com/dev/api/acl/';

  return fetch(MACAROON_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      packages: [{ name: name, series: STORE_SERIES }],
      permissions: ['package_upload']
    })
  }).then((response) => response.json().then((json) => {
    if (response.status === 200 && json.macaroon) {
      return name;
    } else {
      throw new PreparedError(400, RESPONSE_SNAP_NAME_NOT_REGISTERED);
    }
  }));
};

const requestNewSnap = (name, repositoryUrl) => {
  const lpClient = getLaunchpad();
  const username = conf.get('LP_API_USERNAME');

  logger.info(`Creating new snap for ${repositoryUrl}`);
  return lpClient.named_post('/+snaps', 'new', {
    parameters: {
      owner: `/~${username}`,
      distro_series: `/${DISTRIBUTION}/${DISTRO_SERIES}`,
      name: `${makeSnapName(repositoryUrl)}-${DISTRO_SERIES}`,
      git_repository_url: repositoryUrl,
      git_path: 'refs/heads/master',
      auto_build: true,
      auto_build_archive: `/${DISTRIBUTION}/+archive/primary`,
      auto_build_pocket: 'Updates',
      processors: ARCHITECTURES.map((arch) => `/+processors/${arch}`),
      store_upload: true,
      store_series: `/+snappy-series/${STORE_SERIES}`,
      store_name: name,
      store_channels: STORE_CHANNELS
    }
  });
};

export const newSnap = (req, res) => {
  const repositoryUrl = req.body.repository_url;
  const lpClient = getLaunchpad();
  let snapUrl;
  // We need admin permissions in order to be able to install a webhook later.
  checkAdminPermissions(req.session, repositoryUrl)
    .then((result) => {
      return getSnapcraftYaml(result.owner, result.name, result.token);
    })
    .then((snapcraftYaml) => {
      if (!('name' in snapcraftYaml)) {
        throw new PreparedError(400, RESPONSE_SNAPCRAFT_YAML_NO_NAME);
      }
      return verifySnapNameRegistered(snapcraftYaml.name, repositoryUrl);
    })
    .then((name) => requestNewSnap(name, repositoryUrl))
    .then((result) => {
      snapUrl = result.self_link;
      logger.info(`Authorizing ${snapUrl}`);
      return lpClient.named_post(snapUrl, 'beginAuthorization');
    })
    .then((caveatId) => {
      logger.info(`Began authorization of ${snapUrl}`);
      return res.status(201).send({
        status: 'success',
        payload: {
          code: 'snap-created',
          message: caveatId
        }
      });
    })
    .catch((error) => sendError(res, error));
};

const internalFindSnap = async (repositoryUrl) => {
  const cacheId = `url:${repositoryUrl}`;

  return new Promise((resolve, reject) => {
    getMemcached().get(cacheId, (err, result) => {
      if (!err && result !== undefined) {
        return resolve(result);
      }

      getLaunchpad().named_get('/+snaps', 'findByURL', {
        parameters: { url: repositoryUrl }
      })
      .catch((error) => {
        if (error.response.status === 404) {
          return reject(new PreparedError(404, RESPONSE_SNAP_NOT_FOUND));
        }
        // At least for the moment, we just wrap the error we get from
        // Launchpad.
        error.response.text().then((text) => {
          return reject(new PreparedError(error.response.status, {
            status: 'error',
            payload: {
              code: 'lp-error',
              message: text
            }
          }));
        });
      })
      .then(async (result) => {
        const username = conf.get('LP_API_USERNAME');
        // https://github.com/babel/babel-eslint/issues/415
        for await (const entry of result) { // eslint-disable-line semi
          if (entry.owner_link.endsWith(`/~${username}`)) {
            getMemcached().set(cacheId, entry.self_link, 3600, () => {
              return resolve(entry.self_link);
            });
          }
        }
        return reject(new PreparedError(404, RESPONSE_SNAP_NOT_FOUND));
      });
    });
  });
};

export const findSnap = (req, res) => {
  internalFindSnap(req.query.repository_url)
    .then((snapUrl) => {
      return res.status(200).send({
        status: 'success',
        payload: {
          code: 'snap-found',
          message: snapUrl
        }
      });
    })
    .catch((error) => sendError(res, error));
};

// Not a route handler, but kept here so that the beginAuthorization and
// completeAuthorization calls are close together.  Returns a Promise.
export const completeSnapAuthorization = (session, repositoryUrl,
                                          dischargeMacaroon) => {
  let snapUrl;
  return checkAdminPermissions(session, repositoryUrl)
    .then(() => internalFindSnap(repositoryUrl))
    .then((result) => {
      snapUrl = result;
      return getLaunchpad().named_post(snapUrl, 'completeAuthorization', {
        parameters: { discharge_macaroon: dischargeMacaroon },
      });
    })
    .then(() => logger.info(`Completed authorization of ${snapUrl}`))
    .catch((error) => {
      return prepareError(error)
	.then((preparedError) => { throw preparedError; });
    });
};

export const getSnapBuilds = (req, res) => {
  const snapUrl = req.query.snap;

  const start = typeof req.query.start !== 'undefined' ? req.query.start : 0;
  const size = typeof req.query.size !== 'undefined' ? req.query.size : 10;

  if (!snapUrl) {
    return res.status(404).send({
      status: 'error',
      payload: {
        code: 'missing-snap-link',
        message: 'Missing query parameter snap'
      }
    });
  }

  return getLaunchpad().get(snapUrl).then((snap) => {
    return getLaunchpad().get(snap.builds_collection_link, { start: start, size: size })
      .then((builds) => {
        return res.status(200).send({
          status: 'success',
          payload: {
            code: 'snap-builds-found',
            builds: builds.entries
          }
        });
      });
  })
  .catch((error) => sendError(res, error));
};

// This version does not check repository permissions, so use it only in
// code paths that have already done so.  Returns a Promise.
export const uncheckedRequestSnapBuilds = (repositoryUrl) => {
  const lpClient = getLaunchpad();
  return internalFindSnap(repositoryUrl)
    .then((snapUrl) => lpClient.named_post(snapUrl, 'requestAutoBuilds'));
};

export const requestSnapBuilds = (req, res) => {
  checkAdminPermissions(req.session, req.body.repository_url)
    .then(() => uncheckedRequestSnapBuilds(req.body.repository_url))
    .then((builds) => {
      return res.status(201).send({
        status: 'success',
        payload: {
          code: 'snap-builds-requested',
          builds: builds
        }
      });
    })
    .catch((error) => sendError(res, error));
};
