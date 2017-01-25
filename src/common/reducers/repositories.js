import * as ActionTypes from '../actions/repositories';

export function repositories(state = {
  isFetching: false,
  success: false,
  error: null,
  repos: null
}, action) {
  switch(action.type) {
    case ActionTypes.FETCH_REPOSITORIES:
      return {
        ...state,
        isFetching: true
      };
    case ActionTypes.SET_REPOSITORIES:
      return {
        ...state,
        isFetching: false,
        success: true,
        error: null,
        repos: action.payload
      };
    // TODO: bartaz - handle errors
    default:
      return state;
  }
}
