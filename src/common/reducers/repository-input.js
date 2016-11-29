import * as ActionTypes from '../actions/repository-input';

export function repositoryInput(state = {
  isFetching: false,
  inputValue: '',
  repository: null,
  repositoryUrl: null,
  statusMessage: '',
  success: false,
  errors: false
}, action) {
  switch(action.type) {
    case ActionTypes.CHANGE_REPOSITORY_INPUT:
      return {
        ...state,
        inputValue: action.payload
      };
    case ActionTypes.UPDATE_STATUS_MESSAGE:
      return {
        ...state,
        statusMessage: action.payload
      };
    case ActionTypes.VERIFY_GITHUB_REPOSITORY:
      return {
        ...state,
        isFetching: true,
        repository: action.payload
      };
    case ActionTypes.VERIFY_GITHUB_REPOSITORY_SUCCESS:
      return {
        ...state,
        isFetching: false,
        success: true,
        errors: false,
        repositoryUrl: action.payload
      };
    case ActionTypes.VERIFY_GITHUB_REPOSITORY_ERROR:
      return {
        ...state,
        isFetching: false,
        success: false,
        errors: action.payload
      };
    default:
      return state;
  }
}
