import * as ActionTypes from '../actions/snaps';
import { parseGitHubRepoUrl } from '../helpers/github-url';

export function snaps(state = {
  isFetching: false,
  success: false,
  error: null,
  snaps: null,
}, action) {
  switch(action.type) {
    case ActionTypes.FETCH_SNAPS:
      return {
        ...state,
        isFetching: true
      };
    case ActionTypes.FETCH_SNAPS_SUCCESS:
      return {
        ...state,
        isFetching: false,
        success: true,
        snaps: action.payload.map((snap) => {
          return {
            // parse repository info to keep consistent data format
            repo: parseGitHubRepoUrl(snap.git_repository_url),
            // and keep full snap data from API in the store too
            snap
          };
        }),
        error: null
      };
    case ActionTypes.FETCH_SNAPS_ERROR:
      return {
        ...state,
        isFetching: false,
        success: false,
        error: action.payload
      };
    default:
      return state;
  }
}
