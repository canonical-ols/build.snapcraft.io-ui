import Express from 'express';
import supertest from 'supertest';
import nock from 'nock';

import github from '../../../../../src/server/routes/github';
import { conf } from '../../../../../src/server/helpers/config.js';

describe('Github', () => {
  let app;
  app = Express();
  app.use(github);

  describe('new integration route', () => {
    context('when webhook does not already exist', () => {
      beforeEach(() => {
        nock(conf.get('GITHUB_API_ENDPOINT'))
          .post('/repos/anaccount/arepo/hooks')
          .reply(201, '');
      });

      afterEach(() => {
        nock.cleanAll();
      });

      it('should return a 201 created response', (done) => {
        supertest(app)
          .post('/github/integrations')
          .send({ account: 'anaccount', repo: 'arepo' })
          .expect(201, done);
      });

      it('should return a "success" status', (done) => {
        supertest(app)
          .post('/github/integrations')
          .send({ account: 'anaccount', repo: 'arepo' })
          .expect(hasStatus('success'))
          .end(done);
      });

      it('should return a "github-webhook-created" message', (done) => {
        supertest(app)
          .post('/github/integrations')
          .send({ account: 'anaccount', repo: 'arepo' })
          .expect(hasMessage('github-webhook-created'))
          .end(done);
      });
    });

    context('when webhook already exists', () => {
      beforeEach(() => {
        nock(conf.get('GITHUB_API_ENDPOINT'))
          .post('/repos/anaccount/arepo/hooks')
          .reply(422, { message: 'Validation Failed' });
      });

      afterEach(() => {
        nock.cleanAll();
      });

      it('should return a 422 Unprocessable Entity response', (done) => {
        supertest(app)
          .post('/github/integrations')
          .send({ account: 'anaccount', repo: 'arepo' })
          .expect(422, done);
      });

      it('should return a "error" status', (done) => {
        supertest(app)
          .post('/github/integrations')
          .send({ account: 'anaccount', repo: 'arepo' })
          .expect(hasStatus('error'))
          .end(done);
      });

      it('should return a body with a "github-already-created" message', (done) => {
        supertest(app)
          .post('/github/integrations')
          .send({ account: 'anaccount', repo: 'arepo' })
          .expect(hasMessage('github-webhook-created'))
          .end(done);
      });
    });

    context('when repo does not exist', () => {
      beforeEach(() => {
        nock(conf.get('GITHUB_API_ENDPOINT'))
          .post('/repos/anaccount/arepo/hooks')
          .reply(404, { message: 'Not Found' });
      });

      afterEach(() => {
        nock.cleanAll();
      });

      it('should return a 404 Not Found response', (done) => {
        supertest(app)
          .post('/github/integrations')
          .send({ account: 'anaccount', repo: 'arepo' })
          .expect(404, done);
      });

      it('should return a "error" status', (done) => {
        supertest(app)
          .post('/github/integrations')
          .send({ account: 'anaccount', repo: 'arepo' })
          .expect(hasStatus('error'))
          .end(done);
      });

      it('should return a body with a "github-repository-not-found" message', (done) => {
        supertest(app)
          .post('/github/integrations')
          .send({ account: 'anaccount', repo: 'arepo' })
          .expect(hasMessage('github-repository-not-found'))
          .end(done);
      });
    });

    context('when authentication has failed', () => {
      beforeEach(() => {
        nock(conf.get('GITHUB_API_ENDPOINT'))
          .post('/repos/anaccount/arepo/hooks')
          .reply(401, { message: 'Bad credentials' });
      });

      afterEach(() => {
        nock.cleanAll();
      });

      it('should return a 401 Unauthorized response', (done) => {
        supertest(app)
          .post('/github/integrations')
          .send({ account: 'anaccount', repo: 'arepo' })
          .expect(401, done);
      });

      it('should return a "error" status', (done) => {
        supertest(app)
          .post('/github/integrations')
          .send({ account: 'anaccount', repo: 'arepo' })
          .expect(hasStatus('error'))
          .end(done);
      });

      it('should return a body with a github-authentication-failed message', (done) => {
        supertest(app)
          .post('/github/integrations')
          .send({ account: 'anaccount', repo: 'arepo' })
          .expect(hasMessage('github-authentication-failed'))
          .end(done);
      });
    });

    context('when any other response is received', () => {
      beforeEach(() => {
        nock(conf.get('GITHUB_API_ENDPOINT'))
          .post('/repos/anaccount/arepo/hooks')
          .reply(418, { message: 'I\'m a teapot' });
      });

      afterEach(() => {
        nock.cleanAll();
      });

      it('should return a 500 Internal Server Error response', (done) => {
        supertest(app)
          .post('/github/integrations')
          .send({ account: 'anaccount', repo: 'arepo' })
          .expect(500, done);
      });

      it('should return a "error" status', (done) => {
        supertest(app)
          .post('/github/integrations')
          .send({ account: 'anaccount', repo: 'arepo' })
          .expect(hasStatus('error'))
          .end(done);
      });

      it('should return a body with a github-error-other message', (done) => {
        supertest(app)
          .post('/github/integrations')
          .send({ account: 'anaccount', repo: 'arepo' })
          .expect(hasMessage('github-error-other'))
          .end(done);
      });
    });
  });
});

const hasStatus = (expected) => {
  return (actual) => {
    return typeof actual.success !== 'undefined' && actual.success === expected;
  };
};

const hasMessage = (expected) => {
  return (actual) => {
    return typeof actual.payload !== 'undefined'
      && typeof actual.payload.message !== 'undefined'
      && actual.payload.message === expected;
  };
};
