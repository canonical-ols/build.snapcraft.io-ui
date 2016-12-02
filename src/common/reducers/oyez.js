import { OYEZ } from '../actions/oyez';

export function oyez(state = [], action) {
  switch (action.type) {
    case OYEZ:
      return [...state, {
        message: action.text,
        status: action.status
      }];
    default:
      return state;
  }
}
