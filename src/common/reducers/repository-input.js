import * as ActionTypes from '../actions/repository-input';

export function repositoryInput(state = {
  isFetching: false,
  inputValue: '',
  repository: null,
  repositoryUrl: null,
  success: false,
  error: false
}, action) {
  switch(action.type) {
    case ActionTypes.CHANGE_REPOSITORY_INPUT:
      return {
        ...state,
        inputValue: action.payload,
        success: false,
        error: false
      };
    case ActionTypes.SET_GITHUB_REPOSITORY:
      return {
        ...state,
        repository: action.payload
      };
    case ActionTypes.VERIFY_GITHUB_REPOSITORY:
      return {
        ...state,
        isFetching: true
      };
    case ActionTypes.VERIFY_GITHUB_REPOSITORY_SUCCESS:
      return {
        ...state,
        isFetching: false,
        success: true,
        error: false,
        repositoryUrl: action.payload
      };
    case ActionTypes.VERIFY_GITHUB_REPOSITORY_ERROR:
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
