import expect from 'expect';

import { webhook } from '../../../../../src/common/reducers/webhook';

describe('webhook reducers', () => {
  const initialState = {
    isPending: false,
    success: false,
    error: null
  };

  context('when called with an unknown action', () => {
    it('should return the initial state', () => {
      expect(webhook(undefined, {})).toEqual(initialState);
    });
  });

  context('WEBHOOK', () => {
    const action = { type: 'WEBHOOK' };

    it('should store pending state', () => {
      expect(webhook(initialState, action)).toEqual({
        ...initialState,
        isPending: true
      });
    });
  });

  context('WEBHOOK_SUCCESS', () => {
    const state = { ...initialState, isPending: true };
    const action = { type: 'WEBHOOK_SUCCESS' };

    it('should clear pending state', () => {
      expect(webhook(state, action).isPending).toBe(false);
    });

    it('should store success state', () => {
      expect(webhook(state, action).success).toBe(true);
    });
  });

  context('WEBHOOK_FAILURE', () => {
    context('code github-repository-not-found', () => {
      const state = { ...initialState, isPending: true };
      const action = {
        type: 'WEBHOOK_FAILURE',
        code: 'github-repository-not-found'
      };

      it('should clear pending state', () => {
        expect(webhook(state, action).isPending).toBe(false);
      });

      it('should clear success state', () => {
        expect(webhook(state, action).success).toBe(false);
      });

      it('should store error message beginning "A repository could not be found"', () => {
        expect(webhook(state, action).error.message).toBe(
          'A repository could not be found, or access is not granted for given repository details'
        );
      });
    });

    context('code github-authentication-failed', () => {
      const state = { ...initialState, isPending: true };
      const action = {
        type: 'WEBHOOK_FAILURE',
        code: 'github-authentication-failed'
      };

      it('should clear pending state', () => {
        expect(webhook(state, action).isPending).toBe(false);
      });

      it('should clear success state', () => {
        expect(webhook(state, action).success).toBe(false);
      });

      it('should store error message beginning "A problem occurred when accessing repository"', () => {
        expect(webhook(state, action).error.message).toBe(
          'A problem occurred when accessing repository. Please try logging in again'
        );
      });
    });

    context('code github-error-other', () => {
      const state = { ...initialState, isPending: true };
      const action = {
        type: 'WEBHOOK_FAILURE',
        code: 'github-error-other'
      };

      it('should clear pending state', () => {
        expect(webhook(state, action).isPending).toBe(false);
      });

      it('should clear success state', () => {
        expect(webhook(state, action).success).toBe(false);
      });

      it('should store error message beginning "A problem occurred while the repository was being built"', () => {
        expect(webhook(state, action).error.message).toBe(
          'A problem occurred while the repository was being built. Please try again later'
        );
      });
    });
  });
});
