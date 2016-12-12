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

export function fetchBuilds(repository) {
  return (dispatch) => {
    if (repository) {
      dispatch({
        type: FETCH_BUILDS,
        payload: repository
      });

      // TODO: real async call to load the builds
      // return fetch(...)
      //   .then(checkStatus)
      //   ...

      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ entries: BUILDS_MOCK });
        }, 1000);
      }).then((json) => dispatch(fetchBuildsSuccess(json.entries)))
        .catch( error => dispatch(fetchBuildsError(error)));
    }
  };
}

const BUILDS_MOCK = [{
  buildId: '1235',
  username: 'John Doe',
  commitId:  'c196edb',
  commitMessage:  'Current commit',
  architecture: 'i386',
  status:  'pending',
  statusMessage: 'Currently building',
  dateStarted: '2016-12-01T17:08:36.317805+00:00',
  dateCompleted: null,
  duration: '0:02:36.314039'
},{
  buildId: '1234',
  username: 'John Doe',
  commitId:  'a196edb',
  commitMessage:  'Awesome commit',
  architecture: 'i386',
  status:  'success',
  statusMessage: 'Completed',
  dateStarted: '2016-12-01T17:08:36.317805+00:00',
  dateCompleted: '2016-12-01T17:15:36.317805+00:00',
  duration: '0:07:36.314039'
},{
  buildId: '1233',
  username: 'John Doe',
  commitId:  'a1d6edb',
  commitMessage:  'Other commit',
  architecture: 'i386',
  status:  'success',
  statusMessage: 'Completed',
  dateStarted: '2016-12-01T17:08:36.317805+00:00',
  dateCompleted: '2016-12-01T17:09:36.317805+00:00',
  duration: '0:01:00.124039'
},{
  buildId: '1232',
  username: 'John Doe',
  commitId:  'f1d6edb',
  commitMessage:  'Failed commit',
  architecture: 'i386',
  status:  'error',
  statusMessage: 'Failed to build',
  dateStarted: '2016-12-01T17:08:36.317805+00:00',
  dateCompleted: '2016-12-01T17:10:36.317805+00:00',
  duration: '0:02:00.124039'
}];
