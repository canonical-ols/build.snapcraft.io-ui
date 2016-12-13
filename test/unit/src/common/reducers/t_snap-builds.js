import expect from 'expect';

import { snapBuilds } from '../../../../../src/common/reducers/snap-builds';
import * as ActionTypes from '../../../../../src/common/actions/snap-builds';

describe('snapBuilds reducers', () => {
  const initialState = {
    isFetching: false,
    builds: [],
    error: false
  };

  const dummyBuilds = [ { build: 'test1' }, { build: 'test2' }];

  it('should return the initial state', () => {
    expect(snapBuilds(undefined, {})).toEqual(initialState);
  });

  context('FETCH_BUILDS', () => {
    it('should store fetching status when fetching builds', () => {
      const action = {
        type: ActionTypes.FETCH_BUILDS,
        payload: 'test'
      };

      expect(snapBuilds(initialState, action)).toEqual({
        ...initialState,
        isFetching: true
      });
    });
  });

  context('FETCH_BUILDS_SUCCESS', () => {

    it('should store builds on fetch success', () => {
      const state = {
        ...initialState,
        isFetching: true
      };

      const action = {
        type: ActionTypes.FETCH_BUILDS_SUCCESS,
        payload: dummyBuilds
      };

      expect(snapBuilds(state, action)).toEqual({
        ...state,
        isFetching: false,
        builds: dummyBuilds
      });
    });

    it('should clean error', () => {
      const state = {
        ...initialState,
        error: 'Previous error'
      };

      const action = {
        type: ActionTypes.FETCH_BUILDS_SUCCESS,
        payload: dummyBuilds
      };

      expect(snapBuilds(state, action).error).toBe(false);
    });
  });

  context('FETCH_BUILDS_ERROR', () => {
    it('should handle fetch builds failure', () => {
      const state = {
        ...initialState,
        builds: dummyBuilds,
        isFetching: true
      };

      const action = {
        type: ActionTypes.FETCH_BUILDS_ERROR,
        payload: 'Something went wrong!',
        error: true
      };

      expect(snapBuilds(state, action)).toEqual({
        ...state,
        isFetching: false,
        error: action.payload
      });
    });
  });
});
