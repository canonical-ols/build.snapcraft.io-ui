import ROUTE_REDIRECT_URL from '../actions/route-urls.js';

export function routeUrls(state = { currentUrl: false }, action) {
  if (action === ROUTE_REDIRECT_URL) {
    state.currentUrl = action.payload;
  }

  return state;
}
