import * as ActionTypes from '../actions/snaps';
import * as RegisterNameActionTypes from '../actions/register-name';
import { getGitHubRepoUrl } from '../helpers/github-url';
import union from 'lodash/union';

// TODO move to selector
function findSnapByFullName(snaps, fullName) {
  return snaps.find((snap) => {
    return snap.git_repository_url === getGitHubRepoUrl(fullName);
  });
}

function updateRegisteredName(snaps, fullName, snapName) {
  if (!snaps) {
    return snaps;
  }

  const updatedSnaps = [ ...snaps ]; // copy snaps array
  const snap = findSnapByFullName(updatedSnaps, fullName);
  const index = updatedSnaps.indexOf(snap);

  if (snap && index !== -1) {
    // change snap at correct index with new updated snap object
    updatedSnaps[index] = { ...snap, store_name: snapName };
  }

  return updatedSnaps;
}

export function snaps(state = {
  isFetching: false,
  success: false,
  error: null,
  snaps: null,
  ids: []
}, action) {
  switch(action.type) {
    case ActionTypes.FETCH_SNAPS:
      return {
        ...state,
        isFetching: true,
        success: false,
        error: null
      };
      // XXX a little confusing because we're not refactoring this yet, just
      // making do for the repositories refactor
    case ActionTypes.FETCH_SNAPS_SUCCESS:
      return {
        ...state,
        isFetching: false,
        success: true,
        // TODO bartaz refactor
        // snaps object should only be in entities
        snaps: [
          ...action.payload.response.payload.snaps
        ],
        ids: union(state.ids, action.payload.response.result),
        error: null
      };
    case ActionTypes.FETCH_SNAPS_ERROR:
      return {
        ...state,
        isFetching: false,
        success: false,
        error: action.payload.error
      };
    // TODO bartaz refactor
    // make sure registered name is updated in entities
    case RegisterNameActionTypes.REGISTER_NAME_SUCCESS:
      return {
        ...state,
        snaps: updateRegisteredName(state.snaps, action.payload.id, action.payload.snapName)
      };
    case ActionTypes.REMOVE_SNAP:
      return {
        ...state,
        isFetching: true
      };
    case ActionTypes.REMOVE_SNAP_SUCCESS:
      return {
        ...state,
        isFetching: false,
        success: true,
        // TODO bartaz refactor
        // make sure ids are up to date after remove, also remove from entities?
        snaps: (
          state.snaps !== null ?
          state.snaps.filter((snap) => {
            return snap.git_repository_url !== action.payload.repository_url;
          }) : null
        ),
        ids: state.ids.filter((id) => {
          return id !== action.payload.repository_url;
        }),
        error: null
      };
    case ActionTypes.REMOVE_SNAP_ERROR:
      return {
        ...state,
        isFetching: false,
        success: false,
        error: action.payload.error
      };
    default:
      return state;
  }
}
