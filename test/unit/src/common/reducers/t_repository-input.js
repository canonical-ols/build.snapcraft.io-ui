import expect from 'expect';

import { repositoryInput } from '../../../../../src/common/reducers/repository-input';
import * as ActionTypes from '../../../../../src/common/actions/repository-input';

describe('repositoryInput reducers', () => {
  const initialState = {
    isFetching: false,
    inputValue: '',
    repository: null,
    repositoryUrl: null,
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

  it('should save validated repository name', () => {
    const action = {
      type: ActionTypes.SET_GITHUB_REPOSITORY,
      payload: 'foo/bar'
    };

    expect(repositoryInput(initialState, action)).toEqual({
      ...initialState,
      repository: 'foo/bar'
    });
  });

  it('should store fetching status when repository is verified via GH API', () => {
    const action = {
      type: ActionTypes.VERIFY_GITHUB_REPOSITORY,
      payload: 'dummy/repo'
    };

    expect(repositoryInput(initialState, action)).toEqual({
      ...initialState,
      isFetching: true
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
