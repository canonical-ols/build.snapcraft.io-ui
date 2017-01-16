import * as ActionTypes from '../actions/repository-input';
import parseGitHubUrl from 'parse-github-url';

function parseRepository(input) {
  const gitHubRepo = parseGitHubUrl(input);
  return gitHubRepo ? gitHubRepo.repo : null;
}

export function repositoryInput(state = {
  isFetching: false,
  inputValue: '',
  repository: {
// TODO: bartaz
// keep also parsed owner and name here?
//    owner: null,
//    name: null,
    fullName: null
  },
  success: false,
  error: false
}, action) {
  switch(action.type) {
    case ActionTypes.SET_GITHUB_REPOSITORY:
      return {
        ...state,
        inputValue: action.payload,
        repository: {
          ...state.repository,
          fullName: parseRepository(action.payload),
        },
        success: false,
        error: false
      };
    case ActionTypes.CREATE_SNAP:
      return {
        ...state,
        isFetching: true
      };
    case ActionTypes.CREATE_SNAP_ERROR:
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
