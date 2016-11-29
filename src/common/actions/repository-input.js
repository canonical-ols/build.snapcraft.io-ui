import 'isomorphic-fetch';
import parseGitHubUrl from 'parse-github-url';

export const CHANGE_REPOSITORY_INPUT = 'CHANGE_REPOSITORY_INPUT';
export const UPDATE_STATUS_MESSAGE = 'UPDATE_STATUS_MESSAGE';
export const SET_GITHUB_REPOSITORY = 'SET_GITHUB_REPOSITORY';
export const VERIFY_GITHUB_REPOSITORY = 'VERIFY_GITHUB_REPOSITORY';
export const VERIFY_GITHUB_REPOSITORY_SUCCESS = 'VERIFY_GITHUB_REPOSITORY_SUCCESS';
export const VERIFY_GITHUB_REPOSITORY_ERROR = 'VERIFY_GITHUB_REPOSITORY_ERROR';

export function updateInputValue(value) {
  return (dispatch) => {
    dispatch(changeRepositoryInput(value));
    dispatch(validateGitHubRepository(value));
  };
}

export function changeRepositoryInput(value) {
  return {
    type: CHANGE_REPOSITORY_INPUT,
    payload: value
  };
}

export function setGitHubRepository(repository) {
  return {
    type: SET_GITHUB_REPOSITORY,
    payload: repository
  };
}

export function validateGitHubRepository(repository) {
  const gitHubRepo = parseGitHubUrl(repository);
  const repo = gitHubRepo ? gitHubRepo.repo : null;

  if (repo) {
    return setGitHubRepository(repo);
  } else {
    return verifyGitHubRepositoryError(new Error('Invalid repository URL.'));
  }
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
    if (repository) {
      dispatch({
        type: VERIFY_GITHUB_REPOSITORY,
        payload: repository
      });

      return fetch(`https://api.github.com/repos/${repository}/contents/snapcraft.yaml`)
        .then(checkStatus)
        .then(() => dispatch(verifyGitHubRepositorySuccess(`https://github.com/${repository}.git`)))
        .catch(error => dispatch(verifyGitHubRepositoryError(error)));
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
