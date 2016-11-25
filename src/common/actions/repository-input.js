import 'isomorphic-fetch';
import parseGitHubUrl from 'parse-github-url';

export const CHANGE_REPOSITORY_INPUT = 'CHANGE_REPOSITORY_INPUT';
export const UPDATE_STATUS_MESSAGE = 'UPDATE_STATUS_MESSAGE';
export const VERIFY_GITHUB_REPOSITORY = 'VERIFY_GITHUB_REPOSITORY';
export const VERIFY_GITHUB_REPOSITORY_SUCCESS = 'VERIFY_GITHUB_REPOSITORY_SUCCESS';
export const VERIFY_GITHUB_REPOSITORY_ERROR = 'VERIFY_GITHUB_REPOSITORY_ERROR';

export function changeRepositoryInput(value) {
  return {
    type: CHANGE_REPOSITORY_INPUT,
    payload: value
  };
}

export function updateStatusMessage(message) {
  return {
    type: UPDATE_STATUS_MESSAGE,
    payload: message
  };
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    const error = new Error(response.statusText);
    error.response = response;
    throw error;
  }
}

export function verifyGitHubRepository(repository) {
  return (dispatch) => {
    const gitHubRepo = parseGitHubUrl(repository);
    const repo = gitHubRepo ? gitHubRepo.repo : null;

    if (repo) {
      dispatch({
        type: VERIFY_GITHUB_REPOSITORY,
        payload: gitHubRepo.repo
      });

      return fetch(`https://api.github.com/repos/${repo}`)
        .then(checkStatus)
        // TODO:
        //.then(response => response.json())
        // use json.clone_url from response instead of building our own?
        .then(() => dispatch(verifyGitHubRepositorySuccess(`https://github.com/${repo}.git`)))
        .catch(error => dispatch(verifyGitHubRepositoryError(error)));
    } else {
      // TODO: above we return promise, here nothing - inconsistent and harder to test
      dispatch(verifyGitHubRepositoryError(new Error('Invalid repository URL.')));
    }
  };
}

export function verifyGitHubRepositorySuccess(repositoryUrl) {
  return {
    type: VERIFY_GITHUB_REPOSITORY_SUCCESS,
    payload: repositoryUrl
  };
}

export function verifyGitHubRepositoryError(error) {
  return {
    type: VERIFY_GITHUB_REPOSITORY_ERROR,
    payload: error,
    error: true
  };
}
