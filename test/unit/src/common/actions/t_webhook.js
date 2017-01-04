import expect from 'expect';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import nock from 'nock';
import proxyquire from 'proxyquire';
import sinon from 'sinon';

const browserHistoryStub = {};
const { createWebhook } = proxyquire(
  '../../../../../src/common/actions/webhook',
  { 'react-router': { browserHistory: browserHistoryStub } }
);

const middlewares = [ thunk ];
const mockStore = configureMockStore(middlewares);
const BASE_URL = 'http://localhost:8000';

describe('The createWebhook action creator', () => {
  let store;

  beforeEach(() => {
    global.window = {
      location: {
        protocol: 'http:',
        host: 'localhost:8000'
      }
    };
    browserHistoryStub.push = sinon.spy();
  });

  afterEach(() => {
    global.window = undefined;
    delete browserHistoryStub.push;
  });

  context('when submitted repository exists and does not have a build', () => {
    beforeEach(() => {
      nock(BASE_URL)
        .post('/api/github/webhook')
        .reply('201', JSON.stringify({
          status: 'success',
          payload: {
            code: 'github-webhook-created'
          }
        })
      );
      store = mockStore({
        isPending: false,
        success: false,
        error: false
      });
    });

    afterEach(() => {
      nock.cleanAll();
    });

    it('should navigate to builds page', (done) => {
      store.dispatch(createWebhook('example', 'example')).then(() => {
        expect(browserHistoryStub.push.calledWith('/example/example/builds'))
          .toBeTruthy();
        done();
      });
    });
  });

  context('when submitted repository exists and already has a build', () => {
    beforeEach(() => {
      nock(BASE_URL)
        .post('/api/github/webhook')
        .reply('422', JSON.stringify({
          status: 'error',
          payload: {
            code: 'github-already-created'
          }
        })
      );
      store = mockStore({
        isPending: false,
        success: false,
        error: false
      });
    });

    afterEach(() => {
      nock.cleanAll();
    });

    it('should navigate to builds page', (done) => {
      store.dispatch(createWebhook('example', 'example')).then(() => {
        expect(browserHistoryStub.push.calledWith('/example/example/builds'))
          .toBeTruthy();
        done();
      });
    });
  });

  context('when an "expected" error is returned creating webhook', () => {
    beforeEach(() => {
      nock(BASE_URL)
        .post('/api/github/webhook')
        .reply('404', JSON.stringify({
          status: 'error',
          payload: {
            code: 'github-repository-not-found'
          }
        })
      );
      store = mockStore({
        isPending: false,
        success: false,
        error: false
      });
    });

    afterEach(() => {
      nock.cleanAll();
    });

    it('should create an error message action', (done) => {
      store.dispatch(createWebhook('example', 'example')).then(() => {
        expect(store.getActions()).toInclude({
          type: 'WEBHOOK_FAILURE',
          code: 'github-repository-not-found'
        });
        done();
      });
    });
  });

  context('when an "unexpected" error is returned creating webhook', () => {
    beforeEach(() => {
      nock(BASE_URL)
        .post('/api/github/webhook')
        .reply('500', JSON.stringify({}));

      store = mockStore({
        isPending: false,
        success: false,
        error: false
      });
    });

    afterEach(() => {
      nock.cleanAll();
    });

    it('should create an error message action', (done) => {
      store.dispatch(createWebhook('example', 'example')).then(() => {
        expect(store.getActions()).toInclude({
          type: 'WEBHOOK_FAILURE',
          code: 'github-error-other'
        });
        done();
      });
    });
  });
});
