import conf from '../helpers/config';

const BASE_URL = conf.get('BASE_URL');

export const FETCH_BUILDS = 'FETCH_BUILDS';
export const FETCH_BUILDS_SUCCESS = 'FETCH_BUILDS_SUCCESS';
export const FETCH_BUILDS_ERROR = 'FETCH_BUILDS_ERROR';

export function fetchBuildsSuccess(builds) {
  return {
    type: FETCH_BUILDS_SUCCESS,
    payload: builds
  };
}

export function fetchBuildsError(error) {
  return {
    type: FETCH_BUILDS_ERROR,
    payload: error,
    error: true
  };
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    const error = new Error(response.statusText);
    error.status = response.status;
    error.response = response;
    throw error;
  }
}

export function fetchBuilds(repository) {
  return (dispatch) => {

    if (repository) {
      dispatch({
        type: FETCH_BUILDS,
        payload: repository
      });

      // TODO: bartaz
      // mocked URL just for dev test purposes, to be replaced with fetched self_link
      const snap_link = encodeURIComponent('https://api.launchpad.net/devel/~snappy-dev/+snap/core');


      const url = `${BASE_URL}/api/launchpad/builds?snap_link=${snap_link}`;
      return fetch(url)
        .then(checkStatus)
        .then(response => response.json())
        .then((json) => dispatch(fetchBuildsSuccess(json.payload.builds)))
        .catch( error => dispatch(fetchBuildsError(error)));
    }
  };
}
