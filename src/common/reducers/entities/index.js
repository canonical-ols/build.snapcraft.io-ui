import merge from 'lodash/merge';

import * as RepoActionTypes from '../../actions/repository';
import repository from './repository';

// TODO snaps

export function entities(state = {
  snaps: {},
  repos: {},
  owners: {}
}, action) {
  if (action.payload && action.payload.entities) {
    return merge({}, state, action.payload.entities);
  }

  // only modify repos if action is one of REPO_ types
  if (RepoActionTypes[action.type]) {
    return repository(state, action);
  }

  return state;
}
