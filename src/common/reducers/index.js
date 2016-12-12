import { routerReducer } from 'react-router-redux';
import { combineReducers } from 'redux';

import * as repositoryInput from '../reducers/repository-input';
import * as authError from '../reducers/auth-error';
import * as buildsList from '../reducers/builds-list';

const rootReducer = combineReducers({
  ...repositoryInput,
  ...authError,
  ...buildsList,
  routing: routerReducer
});

export default rootReducer;
