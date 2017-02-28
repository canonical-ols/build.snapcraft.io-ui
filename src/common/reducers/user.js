// initialised with server side rendered state

export const DEBUG_SET_USER = 'DEBUG_SET_USER';

export function user(state = null, action) {
  switch(action.type) {
    // set individual user properties for debugging
    case DEBUG_SET_USER:
      return {
        ...state,
        ...action.payload
      };
    default:
      return state;
  }
}
