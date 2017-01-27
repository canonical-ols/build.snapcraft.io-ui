import { routerReducer } from 'react-router-redux';
import { combineReducers } from 'redux';

import * as repository from './repository';
import * as repositoryInput from './repository-input';
import * as repositories from './repositories';
import * as repositoriesStatus from './repositories-status';
import * as authError from './auth-error';
import * as snapBuilds from '../reducers/snap-builds';
import * as auth from './auth';
import * as webhook from './webhook';

const rootReducer = combineReducers({
  ...repository,
  ...repositoryInput,
  ...repositories,
  ...repositoriesStatus,
  ...authError,
  ...snapBuilds,
  ...auth,
  ...webhook,
  routing: routerReducer
});

export default rootReducer;
