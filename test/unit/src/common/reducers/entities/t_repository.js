import expect from 'expect';

import repository from '../../../../../../src/common/reducers/entities/repository.js';
import * as fixtures from './fixtures.js';

describe('repository entities', function() {

  context('reducer', function() {

    let state;

    beforeEach(function() {
      state = repository(fixtures.initialState, {
        type: 'REPO_ADD',
        payload: {
          id: 1001
        }
      });
    });

    it('should update state on REPO_ADD', function() {
      expect(state).toEqual(fixtures.repoAddState);
    });

    it('should update state on REPO_SUCCESS', function() {
      expect(repository(state, {
        type: 'REPO_SUCCESS',
        payload: {
          id: 1001
        }
      })).toEqual(fixtures.repoSuccessState);
    });

    it('should update state on REPO_FAILURE', function() {
      expect(repository(state, {
        type: 'REPO_FAILURE',
        payload: {
          id: 1001,
          error: {
            json: 'something went wrong'
          }
        }
      })).toEqual(fixtures.repoFailureState);
    });

    it('should reset state on REPO_RESET', function() {
      expect(repository(state, {
        type: 'REPO_RESET',
        payload: {
          id: 1001
        }
      })).toEqual(fixtures.repoResetState);
    });

    it('should toggle selected on REPO_TOGGLE_SELECT', function() {
      const state = repository(fixtures.initialState, {
        type: 'REPO_TOGGLE_SELECT',
        payload: {
          id: 1001
        }
      });

      expect(state.repos[1001].isSelected).toBe(true);
    });
  });
});
