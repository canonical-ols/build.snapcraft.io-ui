export const analytics = () => next => action => {
  const dl = window.dataLayer || [];

  dl.push({
    event: action.type,
    payload: action.payload
  });

  return next(action);
};
