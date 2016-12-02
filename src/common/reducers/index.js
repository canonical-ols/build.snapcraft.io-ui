import { routerReducer } from 'react-router-redux';
import { combineReducers } from 'redux';

import * as repositoryInput from '../reducers/repository-input';
import * as oyez from '../reducers/oyez';

const rootReducer = combineReducers({
  ...repositoryInput,
  ...oyez,
  routing: routerReducer
});

export default rootReducer;
