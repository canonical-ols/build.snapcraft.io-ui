import expect from 'expect';

import { repositoryInput } from '../../../../../src/common/reducers/repository-input';
import * as ActionTypes from '../../../../../src/common/actions/repository-input';

describe('repositoryInput reducers', () => {
  const initialState = {
    isFetching: false,
    inputValue: '',
    repository: null,
    success: false,
    error: false
  };

  it('should return the initial state', () => {
    expect(repositoryInput(undefined, {})).toEqual(initialState);
  });

  context('SET_GITHUB_REPOSITORY', () => {
    let action;

    beforeEach(() => {
      action = {
        type: ActionTypes.SET_GITHUB_REPOSITORY,
        payload: ''
      };
    });

    it('should change repository input value', () => {
      action.payload = 'foo';

      expect(repositoryInput(initialState, action)).toInclude({
        inputValue: 'foo'
      });
    });

    it('should save repository name for valid user/repo pair', () => {
      action.payload = 'foo/bar';

      expect(repositoryInput(initialState, action).repository).toInclude({
        fullName: 'foo/bar'
      });
    });

    it('should save repository name for valid repo URL', () => {
      action.payload = 'http://github.com/foo/bar';

      expect(repositoryInput(initialState, action).repository).toInclude({
        fullName: 'foo/bar'
      });
    });

    it('should clear repository for invalid input', () => {
      action.payload = 'foo bar';

      const state = {
        ...initialState,
        repository: { fullName: 'foo/bar' }
      };

      expect(repositoryInput(state, action).repository).toBe(null);
    });

    it('should reset error status', () => {
      const state = {
        ...initialState,
        error: new Error('Test')
      };

      expect(repositoryInput(state, action).error).toBe(false);
    });

    it('should reset success status', () => {
      const state = {
        ...initialState,
        success: true
      };

      expect(repositoryInput(state, action).success).toBe(false);
    });
  });

  context('CREATE_SNAP', () => {
    it('stores fetching status when repository is being created', () => {
      const action = {
        type: ActionTypes.CREATE_SNAP,
        payload: 'dummy/repo'
      };

      expect(repositoryInput(initialState, action)).toEqual({
        ...initialState,
        isFetching: true
      });
    });
  });

  context('CREATE_SNAP_ERROR', () => {
    it('handles snap creation failure', () => {
      const state = {
        ...initialState,
        repository: {
          ...initialState.repository,
          fullName: 'dummy/repo'
        },
        isFetching: true
      };

      const action = {
        type: ActionTypes.CREATE_SNAP_ERROR,
        payload: new Error('Something went wrong!'),
        error: true
      };

      expect(repositoryInput(state, action)).toEqual({
        ...state,
        isFetching: false,
        success: false,
        error: action.payload
      });
    });
  });
});
