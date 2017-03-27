import { checkStatus, getError } from '../helpers/api';

// Action key that carries API call info interpreted by this Redux middleware.
export const CALL_API = 'CALL_API';

// A Redux middleware that interprets actions with CALL_API info specified.
// Performs the call and promises when such actions are dispatched.
export default defaults => () => next => async action => {
  // If action does not invoke CALL_API,
  // ignore it
  const settings = action[CALL_API];
  if (typeof settings === 'undefined') {
    return next(action);
  }

  // Validate action settings
  validateDefaults(defaults);
  validateSettings(settings);

  const [ successType, failureType ] = settings.types;
  const resource = defaults.endpoint + settings.path;
  const optionsWithCsrfToken = withCsrfToken(defaults.csrfToken, settings.options);
  const createAction = createActionWith.bind({}, action);

  try {
    const response = await fetch(resource, optionsWithCsrfToken);
    await checkStatus(response);
    const result = await response.json();

    if (result.status !== 'success') {
      throw getError(response, result);
    }

    return next(createAction({
      type: successType,
      payload: result.payload
    }));
  }
  catch(error) {
    return next(createAction({
      type: failureType,
      payload: error,
      error: true
    }));
  }
};

// Creates new action with request, success or
// failure types, corresponding with the stages
// of the request cycle.
function createActionWith(action, data) {
  const finalAction = Object.assign({}, action, data);
  // Remove properties invoke CALL_API
  delete finalAction[CALL_API];

  return finalAction;
}

function validateDefaults({ endpoint, csrfToken }) {
  if (typeof endpoint !== 'string') {
    throw new Error('Specify a string endpoint URL.');
  }
  if (csrfToken && typeof csrfToken !== 'string') {
    throw new Error('Expected csrfToken to be a string');
  }
}

function validateSettings(settings) {
  const { path, options, types } = settings;
  if (typeof path !== 'string') {
    throw new Error('Specify a string path.');
  }
  if (!options) {
    throw new Error('Specify settings for API request');
  }
  if (!Array.isArray(types) || types.length !== 2) {
    throw new Error('Expected an array of three action types.');
  }
  if (!types.every(type => typeof type === 'string')) {
    throw new Error('Expected action types to be strings.');
  }
}

function withCsrfToken(csrfToken, options) {
  if (csrfToken) {
    if (!options.headers) {
      options.headers = {};
    }

    options.headers = Object.assign({}, options.headers, {
      'X-CSRF-Token': csrfToken
    });
  }

  return options;
}
