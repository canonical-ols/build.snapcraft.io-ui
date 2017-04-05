import * as ActionTypes from '../../actions/repository';

export default function repository(state={
  __isSelected: false,
  __isFetching: false,
  __error: null
}, action) {

  switch(action.type) {
    case ActionTypes.REPO_TOGGLE_SELECT: {
      const wasSelected = state.__isSelected;

      return {
        ...state,
        __isSelected: !wasSelected
      };
    }
    case ActionTypes.REPO_ADD: {
      return {
        ...state,
        __isFetching: true,
        __isSelected: true
      };
    }
    case ActionTypes.REPO_SUCCESS:
    case ActionTypes.REPO_RESET: {
      return {
        ...state,
        __isSelected: false,
        __isFetching: false,
        __error: null
      };
    }
    case ActionTypes.REPO_FAILURE: {
      return {
        ...state,
        __error: action.payload.error.json
      };
    }
    default:
      return state;
  }
}
