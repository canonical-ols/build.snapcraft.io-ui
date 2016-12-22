import { createHash } from 'crypto';

import yaml from 'js-yaml';
import Memcached from 'memcached';
import parseGitHubUrl from 'parse-github-url';

import { conf } from '../helpers/config';
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

const RESPONSE_SNAP_NOT_FOUND = {
  status: 'error',
  payload: {
    code: 'snap-not-found',
    message: 'Cannot find existing snap based on this URL'
  }
};

let memcached = null;

const getMemcached = () => {
  if (memcached === null) {
    memcached = new Memcached(conf.get('MEMCACHED_HOST').split(','),
                              { namespace: 'lp:' });
  }
  return memcached;
};

// Test affordance.
export const setMemcached = (value) => {
  memcached = value;
};

class PreparedError extends Error {
  constructor(status, body) {
    super();
    this.status = status;
    this.body = body;
  }
}

const responseError = (res, error) => {
  if (error.status && error.body) {
    // The error comes with a prepared representation.
    return res.status(error.status).send(error.body);
  } else if (error.response) {
    // if it's ResourceError from LP client at least for the moment
    // we just wrap the error we get from LP
    // XXX cjwatson 2016-12-22: Perhaps refactor to use the PreparedError
    // system above?
    return error.response.text().then((text) => {
      logger.info('Launchpad API error:', text);
      return res.status(error.response.status).send({
        status: 'error',
        payload: {
          code: 'lp-error',
          message: text
        }
      });
    });
  } else {
    return res.status(500).send({
      status: 'error',
      payload: {
        code: 'internal-error',
        message: error.message
      }
    });
  }
};

const checkStatus = (response) => {
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

const checkAdminPermissions = (owner, name, token) => {
  const uri = `/repos/${owner}/${name}`;
  const options = {
    headers: { 'Authorization': `token ${token}` },
    json: true
  };
  logger.info(`Checking permissions for ${owner}/${name}`);
  return requestGitHub.get(uri, options)
    .then(checkStatus)
    .then(response => {
      if (!response.body.permissions || !response.body.permissions.admin) {
        throw new PreparedError(401, RESPONSE_GITHUB_NO_ADMIN_PERMISSIONS);
      }
    });
};

const makeSnapName = (url) => {
  return createHash('md5').update(url).digest('hex');
};

const getSnapcraftYaml = (owner, name, token) => {
  const uri = `/repos/${owner}/${name}/contents/snapcraft.yaml`;
  const options = {
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3.raw'
    }
  };
  logger.info(`Fetching snapcraft.yaml from ${owner}/${name}`);
  return requestGitHub.get(uri, options)
    .then(checkStatus)
    .then((response) => {
      try {
        return yaml.safeLoad(response.body);
      } catch (e) {
        throw new PreparedError(400, RESPONSE_SNAPCRAFT_YAML_PARSE_FAILED);
      }
    });
};

export const newSnap = (req, res) => {
  if (!req.session || !req.session.token) {
    return res.status(401).send(RESPONSE_NOT_LOGGED_IN);
  }
  const token = req.session.token;

  const repositoryUrl = req.body.repository_url;
  const parsed = parseGitHubUrl(repositoryUrl);
  if (parsed === null || parsed.owner === null || parsed.name === null) {
    logger.info(`Cannot parse "${repositoryUrl}"`);
    return res.status(400).send(RESPONSE_GITHUB_BAD_URL);
  }

  const lp_client = getLaunchpad();
  let self_link;
  // We need admin permissions in order to be able to install a webhook later.
  checkAdminPermissions(parsed.owner, parsed.name, token)
    .then(() => getSnapcraftYaml(parsed.owner, parsed.name, token))
    .then((snapcraftYaml) => {
      if (!('name' in snapcraftYaml)) {
        return res.status(400).send(RESPONSE_SNAPCRAFT_YAML_NO_NAME);
      }
      const username = conf.get('LP_API_USERNAME');
      logger.info(`Creating new snap for ${repositoryUrl}`);
      return lp_client.named_post('/+snaps', 'new', {
        parameters: {
          owner: `/~${username}`,
          distro_series: `/${DISTRIBUTION}/${DISTRO_SERIES}`,
          name: `${makeSnapName(repositoryUrl)}-${DISTRO_SERIES}`,
          git_repository_url: repositoryUrl,
          git_path: 'refs/heads/master',
          auto_build: true,
          auto_build_archive: `/${DISTRIBUTION}/+archive/primary`,
          auto_build_pocket: 'Updates',
          processors: ARCHITECTURES.map((arch) => {
            return `/+processors/${arch}`;
          }),
          store_upload: true,
          store_series: `/+snappy-series/${STORE_SERIES}`,
          store_name: snapcraftYaml.name
        }
      });
    })
    .then((result) => {
      self_link = result.self_link;
      logger.info(`Authorizing ${self_link}`);
      return lp_client.named_post(self_link, 'beginAuthorization');
    })
    .then((caveatId) => {
      logger.info(`Began authorization of ${self_link}`);
      return res.status(201).send({
        status: 'success',
        payload: {
          code: 'snap-created',
          message: caveatId
        }
      });
    })
    .catch((error) => responseError(res, error));
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
      }).then(async (result) => {
        const username = conf.get('LP_API_USERNAME');
        // https://github.com/babel/babel-eslint/issues/415
        for await (const entry of result) { // eslint-disable-line semi
          if (entry.owner_link.endsWith(`/~${username}`)) {
            getMemcached().set(cacheId, entry.self_link, 3600, () => {
              return resolve(entry.self_link);
            });
          }
        }
        return resolve(null);
      }).catch((error) => {
        return error.response.text().then((text) => {
          err = new Error();
          err.status = error.response.status;
          err.text = text;
          return reject(err);
        });
      });
    });
  });
};

export const findSnap = (req, res) => {
  internalFindSnap(req.query.repository_url).then((self_link) => {
    if (self_link !== null) {
      return res.status(200).send({
        status: 'success',
        payload: {
          code: 'snap-found',
          message: self_link
        }
      });
    } else {
      return res.status(404).send(RESPONSE_SNAP_NOT_FOUND);
    }
  }).catch((error) => {
    // At least for the moment, we just wrap the error we get from Launchpad.
    return res.status(error.status).send({
      status: 'error',
      payload: {
        code: 'lp-error',
        message: error.text
      }
    });
  });
};

export const completeSnapAuthorization = async (req, res) => {
  // XXX cjwatson 2016-12-15: Limit to only repositories the user owns.
  if (!req.session || !req.session.token) {
    return res.status(401).send(RESPONSE_NOT_LOGGED_IN);
  }

  internalFindSnap(req.body.repository_url).then((self_link) => {
    if (self_link !== null) {
      return getLaunchpad().named_post(self_link, 'completeAuthorization', {
        parameters: { discharge_macaroon: req.body.discharge_macaroon },
      }).then(() => {
        logger.info(`Completed authorization of ${self_link}`);
        return res.status(200).send({
          status: 'success',
          payload: {
            code: 'snap-authorized',
            message: self_link
          }
        });
      });
    } else {
      return res.status(404).send(RESPONSE_SNAP_NOT_FOUND);
    }
  }).catch((error) => {
    // At least for the moment, we just wrap the error we get from Launchpad.
    return res.status(error.status).send({
      status: 'error',
      payload: {
        code: 'lp-error',
        message: error.text
      }
    });
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
  .catch((error) => responseError(res, error));

};
