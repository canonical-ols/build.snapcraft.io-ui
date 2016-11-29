import expect from 'expect';

import { repositoryInput } from '../../../../../src/common/reducers/repository-input';
import * as ActionTypes from '../../../../../src/common/actions/repository-input';

describe('repositoryInput reducers', () => {
  const initialState = {
    isFetching: false,
    inputValue: '',
    repository: null,
    repositoryUrl: null,
    statusMessage: '',
    success: false,
    errors: false
  };

  it('should return the initial state', () => {
    expect(repositoryInput(undefined, {})).toEqual(initialState);
  });

  it('should change repository input value', () => {
    const action = {
      type: ActionTypes.CHANGE_REPOSITORY_INPUT,
      payload: 'foo'
    };

    expect(repositoryInput(initialState, action)).toEqual({
      ...initialState,
      inputValue: 'foo'
    });
  });

  it('should update status message', () => {
    const action = {
      type: ActionTypes.UPDATE_STATUS_MESSAGE,
      payload: 'dummy message here'
    };

    expect(repositoryInput(initialState, action)).toEqual({
      ...initialState,
      statusMessage: 'dummy message here'
    });
  });

  it('should store and verify repository id (user/name)', () => {
    const action = {
      type: ActionTypes.VERIFY_GITHUB_REPOSITORY,
      payload: 'dummy/repo'
    };

    expect(repositoryInput(initialState, action)).toEqual({
      ...initialState,
      isFetching: true,
      repository: 'dummy/repo'
    });
  });

  it('should handle verify repo success', () => {
    const state = {
      ...initialState,
      repository: 'dummy/repo',
      isFetching: true
    };

    const action = {
      type: ActionTypes.VERIFY_GITHUB_REPOSITORY_SUCCESS,
      payload: 'http://github.com/dummy/repo.git'
    };

    expect(repositoryInput(state, action)).toEqual({
      ...state,
      isFetching: false,
      repositoryUrl: 'http://github.com/dummy/repo.git',
      success: true
    });
  });

  it('should clean errors on success', () => {
    const state = {
      ...initialState,
      repository: 'dummy/repo',
      errors: 'Previous error'
    };

    const action = {
      type: ActionTypes.VERIFY_GITHUB_REPOSITORY_SUCCESS,
      payload: 'http://github.com/dummy/repo.git'
    };

    expect(repositoryInput(state, action).errors).toBe(false);
  });

  it('should handle verify repo failure', () => {
    const state = {
      ...initialState,
      repository: 'dummy/repo',
      isFetching: true
    };

    const action = {
      type: ActionTypes.VERIFY_GITHUB_REPOSITORY_ERROR,
      payload: { error: 'Something went wrong!' }
    };

    expect(repositoryInput(state, action)).toEqual({
      ...state,
      isFetching: false,
      success: false,
      errors: { error: 'Something went wrong!' }
    });
  });
});
