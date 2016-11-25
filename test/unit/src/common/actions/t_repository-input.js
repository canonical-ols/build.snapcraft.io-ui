import expect from 'expect';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import nock from 'nock';
import { isFSA } from 'flux-standard-action';

import {
  changeRepositoryInput,
  updateStatusMessage,
  verifyGitHubRepository,
  verifyGitHubRepositorySuccess,
  verifyGitHubRepositoryError
} from '../../../../../src/common/actions/repository-input';
import * as ActionTypes from '../../../../../src/common/actions/repository-input';

const middlewares = [ thunk ];
const mockStore = configureMockStore(middlewares);

describe('repository input actions', () => {
  const initialState = {
    isFetching: false,
    inputValue: '',
    repository: null,
    repositoryUrl: null,
    statusMessage: '',
    success: false,
    errors: false
  };

  let store;
  let action;

  beforeEach(() => {
    store = mockStore(initialState);
  });

  context('changeRepositoryInput', () => {
    let payload = 'foo input';

    beforeEach(() => {
      action = changeRepositoryInput(payload);
    });

    it('should create an action to change repository input value', () => {
      const expectedAction = {
        type: ActionTypes.CHANGE_REPOSITORY_INPUT,
        payload
      };

      store.dispatch(action);
      expect(store.getActions()).toInclude(expectedAction);
    });

    it('should create a valid flux standard action', () => {
      expect(isFSA(action)).toBe(true);
    });
  });

  context('updateStatusMessage', () => {
    let payload = 'test status message';

    beforeEach(() => {
      action = updateStatusMessage(payload);
    });

    it('should create an action to update status message', () => {
      const expectedAction = {
        type: ActionTypes.UPDATE_STATUS_MESSAGE,
        payload
      };

      store.dispatch(action);
      expect(store.getActions()).toInclude(expectedAction);
    });

    it('should create a valid flux standard action', () => {
      expect(isFSA(action)).toBe(true);
    });
  });

  context('verifyGitHubRepositorySuccess', () => {
    let payload = 'http://github.com/foo/bar.git';

    beforeEach(() => {
      action = verifyGitHubRepositorySuccess(payload);
    });

    it('should create an action to save github repo url on success', () => {
      const expectedAction = {
        type: ActionTypes.VERIFY_GITHUB_REPOSITORY_SUCCESS,
        payload
      };

      store.dispatch(action);
      expect(store.getActions()).toInclude(expectedAction);
    });

    it('should create a valid flux standard action', () => {
      expect(isFSA(action)).toBe(true);
    });
  });

  context('verifyGitHubRepositoryError', () => {
    let payload = 'Something went wrong!';

    beforeEach(() => {
      action = verifyGitHubRepositoryError(payload);
    });

    it('should create an action to store github repo error on failure', () => {
      const expectedAction = {
        type: ActionTypes.VERIFY_GITHUB_REPOSITORY_ERROR,
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

  context('verifyGitHubRepository', () => {
    let scope;

    beforeEach(() => {
      scope = nock('https://api.github.com');
    });

    afterEach(() => {
      nock.cleanAll();
    });

    it('should save GitHub repo on successful verification', () => {
      scope.get('/repos/foo/bar')
        .reply(200, {
          'id': 123456,
          'name': 'bar',
          'full_name': 'foo/bar',
          'owner': {
            'login': 'bar',
          },
          'clone_url': 'https://github.com/foo/bar.git'
        });

      return store.dispatch(verifyGitHubRepository('foo/bar'))
        .then(() => {
          expect(store.getActions()).toHaveActionOfType(
            ActionTypes.VERIFY_GITHUB_REPOSITORY_SUCCESS
          );
        });
    });

    it('should store error on GitHub verification failure', () => {
      scope.get('/repos/foo/bar')
        .reply(404, {
          'message': 'Not Found',
          'documentation_url': 'https://developer.github.com/v3'
        });

      return store.dispatch(verifyGitHubRepository('foo/bar'))
        .then(() => {
          expect(store.getActions()).toHaveActionOfType(
            ActionTypes.VERIFY_GITHUB_REPOSITORY_ERROR
          );
        });
    });

    it('should fail on invalid input', () => {
      store.dispatch(verifyGitHubRepository('invalid input'));
      expect(store.getActions()).toHaveActionOfType(
        ActionTypes.VERIFY_GITHUB_REPOSITORY_ERROR
      );
    });


  });

});
