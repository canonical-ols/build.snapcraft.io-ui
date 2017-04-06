import merge from 'lodash/merge';

import * as RepoActionTypes from '../../actions/repository';

import repository from './repository';


// TODO snaps

export function entities(state = { snaps: {}, repos: {} }, action) {
  if (action.payload && action.payload.entities) {
    return merge({}, state, action.payload.entities);
  }

  // XXX
  // some action that don't use CALL_API middleware pass entities in payload directly
  // while CALL_API middleware does it in response prop
  if (action.payload && action.payload.response && action.payload.response.entities) {
    return merge({}, state, action.payload.response.entities);
  }

  // only modify repos if action is one of REPO_ types
  if (action.payload && action.payload.id && RepoActionTypes[action.type]) {
    return {
      ...state,
      repos: {
        ...state.repos,
        [action.payload.id]: repository(state.repos[action.payload.id], action)
      }
    };
  }

  return state;
}
