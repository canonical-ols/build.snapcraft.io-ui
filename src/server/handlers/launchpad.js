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
const STORE_SERIES = '16';

const RESPONSE_GITHUB_BAD_URL = {
  status: 'error',
  payload: {
    code: 'github-bad-url',
    message: 'Cannot parse GitHub URL'
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

const makeSnapName = url => {
  return createHash('md5').update(url).digest('hex');
};

const getSnapcraftYaml = (req, res, callback) => {
  const parsed = parseGitHubUrl(req.body.repository_url);
  if (parsed === null || parsed.owner === null || parsed.name === null) {
    return res.status(400).send(RESPONSE_GITHUB_BAD_URL);
  }

  const uri = `/repos/${parsed.owner}/${parsed.name}/contents/snapcraft.yaml`;
  const options = {
    headers: {
      'Authorization': `token ${req.session.token}`,
      'Accept': 'application/vnd.github.v3.raw'
    }
  };
  return requestGitHub.get(uri, options, (err, response, body) => {
    if (response.statusCode !== 200) {
      try {
        body = JSON.parse(body);
      } catch (e) {
        logger.info('Invalid JSON received', err, body);
        return res.status(500).send(RESPONSE_GITHUB_OTHER);
      }
      switch (body.message) {
        case 'Not Found':
          // snapcraft.yaml not found
          return res.status(404).send(RESPONSE_GITHUB_NOT_FOUND);
        case 'Bad credentials':
          // Authentication failed
          return res.status(401).send(RESPONSE_GITHUB_AUTHENTICATION_FAILED);
        default:
          // Something else
          logger.info('GitHub API error', err, body);
          return res.status(500).send(RESPONSE_GITHUB_OTHER);
      }
    }

    let snapcraftYaml;
    try {
      snapcraftYaml = yaml.safeLoad(body);
    } catch (e) {
      return res.status(400).send(RESPONSE_SNAPCRAFT_YAML_PARSE_FAILED);
    }
    return callback(snapcraftYaml);
  });
};

// XXX cjwatson 2016-12-13: We should set an appropriate set of
// architectures.
export const newSnap = (req, res) => {
  getSnapcraftYaml(req, res, snapcraftYaml => {
    const repositoryUrl = req.body.repository_url;
    if (!('name' in snapcraftYaml)) {
      return res.status(400).send(RESPONSE_SNAPCRAFT_YAML_NO_NAME);
    }
    const lp_client = getLaunchpad();
    const username = conf.get('LP_API_USERNAME');
    lp_client.named_post('/+snaps', 'new', {
      parameters: {
        owner: `/~${username}`,
        distro_series: `/${DISTRIBUTION}/${DISTRO_SERIES}`,
        name: `${makeSnapName(repositoryUrl)}-${DISTRO_SERIES}`,
        git_repository_url: repositoryUrl,
        git_path: 'refs/heads/master',
        auto_build: true,
        auto_build_archive: `/${DISTRIBUTION}/+archive/primary`,
        auto_build_pocket: 'Updates',
        store_upload: true,
        store_series: `/+snappy-series/${STORE_SERIES}`,
        store_name: snapcraftYaml.name
      }
    }).then(result => {
      lp_client.named_post(result.self_link, 'beginAuthorization', {
        parameters: { success_url: req.body.success_url }
      }).then(result => {
        return res.redirect(result);
      });
    }).catch(error => {
      // At least for the moment, we just wrap the error we get from
      // Launchpad.
      return error.response.text().then(text => {
        return res.status(error.response.status).send({
          status: 'error',
          payload: {
            code: 'lp-error',
            message: text
          }
        });
      });
    });
  });
};

export const findSnap = async (req, res) => {
  const repositoryUrl = req.query.repository_url;
  const cacheId = `url:${repositoryUrl}`;

  getMemcached().get(cacheId, (err, result) => {
    if (!err && result !== undefined) {
      return result;
    }

    const lp_client = getLaunchpad();
    lp_client.named_get('/+snaps', 'findByURL', {
      parameters: { url: repositoryUrl }
    }).then(async result => {
      const username = conf.get('LP_API_USERNAME');
      // https://github.com/babel/babel-eslint/issues/415
      for await (const entry of result) { // eslint-disable-line semi
        if (entry.owner_link.endsWith(`/~${username}`)) {
          return getMemcached().set(cacheId, entry.self_link, 3600, () => {
            return res.status(200).send({
              status: 'success',
              payload: {
                code: 'snap-found',
                message: entry.self_link
              }
            });
          });
        }
      }
      return res.status(404).send(RESPONSE_SNAP_NOT_FOUND);
    }).catch(error => {
      // At least for the moment, we just wrap the error we get from
      // Launchpad.
      return error.response.text().then(text => {
        return res.status(error.response.status).send({
          status: 'error',
          payload: {
            code: 'lp-error',
            message: text
          }
        });
      });
    });
  });
};
