import { conf } from '../helpers/config';
import request from 'request';

const GITHUB_USERNAME = conf.get('GITHUB_USERNAME');
const GITHUB_PASSWORD = conf.get('GITHUB_PASSWORD');
const GITHUB_API_ENDPOINT = conf.get('GITHUB_API_ENDPOINT');
const HTTP_PROXY = conf.get('HTTP_PROXY');

const RESPONSE_NOT_FOUND = {
  status: 'error',
  payload: {
    message: 'github-repository-not-found'
  }
};

const RESPONSE_AUTHENTICATION_FAILED = {
  status: 'error',
  payload: {
    message: 'github-authentication-failed'
  }
};

const RESPONSE_OTHER = {
  status: 'error',
  payload: {
    message: 'github-error-other'
  }
};

const RESPONSE_ALREADY_CREATED = {
  status: 'error',
  payload: {
    message: 'github-already-created'
  }
};

const RESPONSE_CREATED = {
  status: 'success',
  payload: {
    message: 'github-webhook-created'
  }
};

export const newIntegration = (req, res) => {
  const account = req.body.account;
  const repo = req.body.repo;

  const options = getRequest(account, repo);
  request.post(options, (err, response, body) => {
    if (response.statusCode !== 201) {
      switch (body.message) {
        case 'Not Found':
          // Repoistory does not exist or access not granted
          return res.status(404).send(RESPONSE_NOT_FOUND);
        case 'Bad credentials':
          // Authentication failed
          return res.status(401).send(RESPONSE_AUTHENTICATION_FAILED);
        case 'Validation Failed':
          // Webhook already created
          return res.status(422).send(RESPONSE_ALREADY_CREATED);
        default:
          // Something else
          return res.status(500).send(RESPONSE_OTHER);
      }
    }

    return res.status(201).send(RESPONSE_CREATED);
  });
};

const getRequest = (account, repo) => {
  return {
    url: GITHUB_API_ENDPOINT + `/repos/${account}/${repo}/hooks`,
    proxy: HTTP_PROXY,
    headers: {
      'User-Agent': 'SnapCraftBuild'
    },
    auth: {
      'username': GITHUB_USERNAME,
      'password': GITHUB_PASSWORD
    },
    json: {
      name: 'web',
      active: true,
      events: [
        'push'
      ],
      config: {
        url: conf.get('WEBHOOK_ENDPOINT'),
        content_type: 'json'
      }
    }
  };
};
