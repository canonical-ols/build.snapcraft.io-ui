import expect from 'expect';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import nock from 'nock';
import { isFSA } from 'flux-standard-action';

import { conf } from '../../../../../src/server/helpers/config';

import {
  fetchSnap,
  fetchBuilds,
  fetchBuildsSuccess,
  fetchBuildsError
} from '../../../../../src/common/actions/snap-builds';
import * as ActionTypes from '../../../../../src/common/actions/snap-builds';

const middlewares = [ thunk ];
const mockStore = configureMockStore(middlewares);

describe('repository input actions', () => {
  const initialState = {
    isFetching: false,
    builds: [],
    error: false
  };

  let store;
  let action;

  beforeEach(() => {
    store = mockStore(initialState);
  });

  context('fetchBuildsSuccess', () => {
    let payload = [ { build: 'test1' }, { build: 'test2' }];

    beforeEach(() => {
      action = fetchBuildsSuccess(payload);
    });

    it('should create an action to store snap builds', () => {
      const expectedAction = {
        type: ActionTypes.FETCH_BUILDS_SUCCESS,
        payload
      };

      store.dispatch(action);
      expect(store.getActions()).toInclude(expectedAction);
    });

    it('should create a valid flux standard action', () => {
      expect(isFSA(action)).toBe(true);
    });
  });

  context('fetchBuildsError', () => {
    let payload = 'Something went wrong!';

    beforeEach(() => {
      action = fetchBuildsError(payload);
    });

    it('should create an action to store request error on failure', () => {
      const expectedAction = {
        type: ActionTypes.FETCH_BUILDS_ERROR,
        error: true,
        payload
      };

      store.dispatch(action);
      expect(store.getActions()).toInclude(expectedAction);
    });

    it('should create a valid flux standard action', () => {
      expect(isFSA(action)).toBe(true);
    });
  });

  context('fetchBuilds', () => {
    let api;

    beforeEach(() => {
      api = nock(conf.get('BASE_URL'));
    });

    afterEach(() => {
      nock.cleanAll();
    });

    it('should store builds on fetch success', () => {
      api.get('/api/launchpad/builds')
        .query({ snap_link: 'http://api.example.com/test/+snap' }) // accept any snap_link in query
        .reply(200, {
          status: 'success',
          payload: {
            code: 'snap-builds-found',
            builds: []
          }
        });

      return store.dispatch(fetchBuilds('http://api.example.com/test/+snap'))
        .then(() => {
          api.done();
          expect(store.getActions()).toHaveActionOfType(
            ActionTypes.FETCH_BUILDS_SUCCESS
          );
        });
    });

    // TODO: pending - mocked actions never fail
    xit('should store error on Launchpad request failure', () => {
      // return store.dispatch(fetchBuilds( '...' ))
      //   .then(() => {
      //     expect(store.getActions()).toHaveActionOfType(
      //       ActionTypes.FETCH_BUILDS_ERROR
      //     );
      //   });
    });

  });

  context('fetchSnap', () => {
    let api;

    beforeEach(() => {
      api = nock(conf.get('BASE_URL'));
    });

    afterEach(() => {
      nock.cleanAll();
    });

    it('should store builds on fetch success', () => {
      const repo = 'foo/bar';
      const repositoryUrl = `https://github.com/${repo}.git`;
      const snapUrl = 'https://api.launchpad.net/devel/~foo/+snap/bar';

      api.get('/api/launchpad/snaps')
        .query({
          repository_url: repositoryUrl // should be called with valid GH url
        })
        .reply(200, {
          status: 'success',
          payload: {
            code: 'snap-found',
            message: snapUrl
          }
        });
      api.get('/api/launchpad/builds')
        .query({
          snap_link: snapUrl // should match what /api/launchpad/snaps returned
        })
        .reply(200, {
          status: 'success',
          payload: {
            code: 'snap-builds-found',
            builds: []
          }
        });

      return store.dispatch(fetchSnap('foo/bar'))
        .then(() => {
          api.done();
          expect(store.getActions()).toHaveActionOfType(
            ActionTypes.FETCH_BUILDS_SUCCESS
          );
        });
    });

    // TODO: pending - mocked actions never fail
    xit('should store error on Launchpad request failure', () => {
      // return store.dispatch(fetchSnap('foo/bar'))
      //   .then(() => {
      //     expect(store.getActions()).toHaveActionOfType(
      //       ActionTypes.FETCH_BUILDS_ERROR
      //     );
      //   });
    });

  });

});
