export const ROUTE_REDIRECT_URL = 'ROUTE_REDIRECT_URL';

export function routeRedirectUrl(url) {
  return {
    type: ROUTE_REDIRECT_URL,
    payload: url
  };
}
