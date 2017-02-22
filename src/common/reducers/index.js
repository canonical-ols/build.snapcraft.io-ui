import { routerReducer } from 'react-router-redux';
import { combineReducers } from 'redux';

import * as repository from './repository';
import * as repositories from './repositories';
import * as repositoriesStatus from './repositories-status';
import * as authError from './auth-error';
import * as selectRepositoriesForm from './select-repositories-form';
import * as snapBuilds from './snap-builds';
import * as snaps from './snaps';
import * as user from './user';
import * as auth from './auth';
import * as authStore from './auth-store';
import * as webhook from './webhook';
import * as registerName from './register-name';
import * as routeUrls from './route-urls.js';

const rootReducer = combineReducers({
  ...repository,
  ...repositories,
  ...repositoriesStatus,
  ...authError,
  ...selectRepositoriesForm,
  ...snapBuilds,
  ...snaps,
  ...user,
  ...auth,
  ...authStore,
  ...webhook,
  ...registerName,
  ...routeUrls,
  routing: routerReducer
});

export default rootReducer;
