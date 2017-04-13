import expect from 'expect';
import Express from 'express';
import nock from 'nock';
import supertest from 'supertest';

import {
  resetMemcached,
  setupInMemoryMemcached
} from '../../../../../src/server/helpers/memcached';
import store from '../../../../../src/server/routes/store';
import { conf } from '../../../../../src/server/helpers/config';

describe('The store API endpoint', () => {
  const app = Express();
  app.use(store);

  describe('register-name route', () => {
    beforeEach(() => {
      setupInMemoryMemcached();
    });

    afterEach(() => {
      resetMemcached();
      nock.cleanAll();
    });

    it('passes request through to store', (done) => {
      const scope = nock(conf.get('STORE_API_URL'))
        .post('/register-name/', { snap_name: 'test-snap' })
        .matchHeader(
          'Authorization',
          'Macaroon root="dummy-root", discharge="dummy-discharge"'
        )
        .reply(201, { snap_id: 'test-snap-id' });

      supertest(app)
        .post('/store/register-name')
        .send({
          snap_name: 'test-snap',
          repository_url: 'https://github.com/anowner/arepo',
          root: 'dummy-root',
          discharge: 'dummy-discharge'
        })
        .expect((res) => {
          scope.done();
          expect(res.status).toBe(201);
          expect(res.body).toEqual({ snap_id: 'test-snap-id' });
        })
        .end(done);
    });

    it('handles error responses reasonably', (done) => {
      const error = {
        code: 'user-not-ready',
        message: 'Developer has not signed agreement.'
      };
      const scope = nock(conf.get('STORE_API_URL'))
        .post('/register-name/', { snap_name: 'test-snap' })
        .matchHeader(
          'Authorization',
          'Macaroon root="dummy-root", discharge="dummy-discharge"'
        )
        .reply(403, { error_list: [error] });

      supertest(app)
        .post('/store/register-name')
        .send({
          snap_name: 'test-snap',
          repository_url: 'https://github.com/anowner/arepo',
          root: 'dummy-root',
          discharge: 'dummy-discharge'
        })
        .expect((res) => {
          scope.done();
          expect(res.status).toBe(403);
          expect(res.body).toEqual({ error_list: [error] });
        })
        .end(done);
    });
  });

  describe('GET account route', () => {
    afterEach(() => {
      nock.cleanAll();
    });

    it('passes request through to store', (done) => {
      const scope = nock(conf.get('STORE_API_URL'))
        .get('/account')
        .matchHeader(
          'Authorization',
          'Macaroon root="dummy-root", discharge="dummy-discharge"'
        )
        .reply(200, { account_id: 'test-account-id' });

      supertest(app)
        .get('/store/account')
        .query({
          root: 'dummy-root',
          discharge: 'dummy-discharge'
        })
        .expect((res) => {
          scope.done();
          expect(res.status).toBe(200);
          expect(res.body).toEqual({ account_id: 'test-account-id' });
        })
        .end(done);
    });

    it('handles error responses reasonably', (done) => {
      const error = {
        code: 'user-not-ready',
        message: 'Developer has not signed agreement.'
      };
      const scope = nock(conf.get('STORE_API_URL'))
        .get('/account')
        .matchHeader(
          'Authorization',
          'Macaroon root="dummy-root", discharge="dummy-discharge"'
        )
        .reply(403, { error_list: [error] });

      supertest(app)
        .get('/store/account')
        .query({
          root: 'dummy-root',
          discharge: 'dummy-discharge'
        })
        .expect((res) => {
          scope.done();
          expect(res.status).toBe(403);
          expect(res.body).toEqual({ error_list: [error] });
        })
        .end(done);
    });
  });

  describe('PATCH account route', () => {
    afterEach(() => {
      nock.cleanAll();
    });

    it('passes request through to store', (done) => {
      const scope = nock(conf.get('STORE_API_URL'))
        .patch('/account', { short_namespace: 'test-namespace' })
        .matchHeader(
          'Authorization',
          'Macaroon root="dummy-root", discharge="dummy-discharge"'
        )
        .reply(204);

      supertest(app)
        .patch('/store/account')
        .send({
          short_namespace: 'test-namespace',
          root: 'dummy-root',
          discharge: 'dummy-discharge'
        })
        .expect((res) => {
          scope.done();
          expect(res.status).toBe(204);
          expect(res.body).toEqual({});
        })
        .end(done);
    });

    it('handles error responses reasonably', (done) => {
      const error = {
        code: 'user-not-ready',
        message: 'Developer has not signed agreement.'
      };
      const scope = nock(conf.get('STORE_API_URL'))
        .patch('/account', { short_namespace: 'test-namespace' })
        .matchHeader(
          'Authorization',
          'Macaroon root="dummy-root", discharge="dummy-discharge"'
        )
        .reply(403, { error_list: [error] });

      supertest(app)
        .patch('/store/account')
        .send({
          short_namespace: 'test-namespace',
          root: 'dummy-root',
          discharge: 'dummy-discharge'
        })
        .expect((res) => {
          scope.done();
          expect(res.status).toBe(403);
          expect(res.body).toEqual({ error_list: [error] });
        })
        .end(done);
    });
  });

  describe('sign agreement route', () => {
    afterEach(() => {
      nock.cleanAll();
    });

    it('passes request through to store', (done) => {
      const scope = nock(conf.get('STORE_API_URL'))
        .post('/agreement/', { latest_tos_accepted: true })
        .matchHeader(
          'Authorization',
          'Macaroon root="dummy-root", discharge="dummy-discharge"'
        )
        .reply(200, { latest_tos_accepted: true });

      supertest(app)
        .post('/store/agreement')
        .send({
          latest_tos_accepted: true,
          root: 'dummy-root',
          discharge: 'dummy-discharge'
        })
        .expect((res) => {
          scope.done();
          expect(res.status).toBe(200);
          expect(res.body).toEqual({ latest_tos_accepted: true });
        })
        .end(done);
    });

    it('handles error responses reasonably', (done) => {
      const error = {
        code: 'bad-request',
        message: '`latest_tos_accepted` must be `true`'
      };
      const scope = nock(conf.get('STORE_API_URL'))
        .post('/agreement/', { latest_tos_accepted: false })
        .matchHeader(
          'Authorization',
          'Macaroon root="dummy-root", discharge="dummy-discharge"'
        )
        .reply(400, { error_list: [error] });

      supertest(app)
        .post('/store/agreement')
        .send({
          latest_tos_accepted: false,
          root: 'dummy-root',
          discharge: 'dummy-discharge'
        })
        .expect((res) => {
          scope.done();
          expect(res.status).toBe(400);
          expect(res.body).toEqual({ error_list: [error] });
        })
        .end(done);
    });
  });

  describe('name-ownership route', () => {

    context('when snap_name is not specified', () => {
      it('should return error', async () => {
        const response = await supertest(app)
          .get('/store/name-ownership')
          .send({
            snap_name: '',
            root: 'dummy-root',
            discharge: 'dummy-discharge'
          });

        expect(response.status).toBe(400);
        expect(response.body).toInclude({
          status: 'error',
          code: 'snap-name-not-specified'
        });
      });
    });

    context('when given snap name is not registered in the store', () => {
      let api;
      const snapName = 'test-snap';

      beforeEach(() => {
        api = nock(conf.get('STORE_API_URL'))
          .post('/acl/', {
            packages: [{ name: snapName }],
            permissions: ['package_upload']
          })
          .reply(400, { status: 'error' });
      });

      afterEach(() => {
        api.done();
        nock.cleanAll();
      });

      it('should return "name-ownership-not-registered" status code', async () => {
        const response = await supertest(app)
          .get('/store/name-ownership')
          .query({
            snap_name: snapName,
            root: 'dummy-root',
            discharge: 'dummy-discharge'
          });

        expect(response.status).toBe(200);
        expect(response.body).toInclude({
          status: 'success',
          code: 'name-ownership-not-registered'
        });
      });
    });

    context('in case of some error', () => {
      let api;
      const snapName = 'test-snap';

      beforeEach(() => {
        api = nock(conf.get('STORE_API_URL'))
          .post('/acl/', {
            packages: [{ name: snapName }],
            permissions: ['package_upload']
          })
          .reply(500, '<html>SOMETHING BAD HAPPENED</html>');
      });

      afterEach(() => {
        api.done();
        nock.cleanAll();
      });

      it('should return "name-ownership-failure" error code', async () => {
        const response = await supertest(app)
          .get('/store/name-ownership')
          .query({
            snap_name: snapName,
            root: 'dummy-root',
            discharge: 'dummy-discharge'
          });

        expect(response.status).toBe(500);
        expect(response.body).toInclude({
          status: 'error',
          code: 'name-ownership-failure'
        });
      });
    });

    context('when given snap name is registered by current user', () => {
      let api;
      const snapName = 'test-snap';

      beforeEach(() => {
        api = nock(conf.get('STORE_API_URL'))
          .post('/acl/', {
            packages: [{ name: snapName }],
            permissions: ['package_upload']
          })
          .reply(200, { macaroon: 'test-macaroon' })
          .post('/register-name/', { snap_name: snapName })
          .matchHeader(
            'Authorization',
            'Macaroon root="dummy-root", discharge="dummy-discharge"'
          )
          .reply(409, { code: 'already_owned' });
      });

      afterEach(() => {
        api.done();
        nock.cleanAll();
      });

      it('should return "name-ownership-already-owned" status code', async () => {
        const response = await supertest(app)
          .get('/store/name-ownership')
          .query({
            snap_name: snapName,
            root: 'dummy-root',
            discharge: 'dummy-discharge'
          });

        expect(response.status).toBe(200);
        expect(response.body).toInclude({
          status: 'success',
          code: 'name-ownership-already-owned'
        });
      });
    });

    context('when given snap name is registered by another user', () => {
      let api;
      const snapName = 'test-snap';

      beforeEach(() => {
        api = nock(conf.get('STORE_API_URL'))
          .post('/acl/', {
            packages: [{ name: snapName }],
            permissions: ['package_upload']
          })
          .reply(200, { macaroon: 'test-macaroon' })
          .post('/register-name/', { snap_name: snapName })
          .matchHeader(
            'Authorization',
            'Macaroon root="dummy-root", discharge="dummy-discharge"'
          )
          .reply(409, { code: 'already_registered' });
      });

      afterEach(() => {
        api.done();
        nock.cleanAll();
      });

      it('should return "name-ownership-registered-by-other-user" status code', async () => {
        const response = await supertest(app)
          .get('/store/name-ownership')
          .query({
            snap_name: snapName,
            root: 'dummy-root',
            discharge: 'dummy-discharge'
          });

        expect(response.status).toBe(200);
        expect(response.body).toInclude({
          status: 'success',
          code: 'name-ownership-registered-by-other-user'
        });
      });
    });

    context('when name registration result is not 409 Conflict', () => {
      let api;
      const snapName = 'test-snap';

      beforeEach(() => {
        api = nock(conf.get('STORE_API_URL'))
          .post('/acl/', {
            packages: [{ name: snapName }],
            permissions: ['package_upload']
          })
          .reply(200, { macaroon: 'test-macaroon' })
          .post('/register-name/', { snap_name: snapName })
          .matchHeader(
            'Authorization',
            'Macaroon root="dummy-root", discharge="dummy-discharge"'
          )
          .reply(200);
      });

      afterEach(() => {
        api.done();
        nock.cleanAll();
      });

      it('should return "name-ownership-registered-by-other-user" status code', async () => {
        const response = await supertest(app)
          .get('/store/name-ownership')
          .query({
            snap_name: snapName,
            root: 'dummy-root',
            discharge: 'dummy-discharge'
          });

        expect(response.status).toBe(500);
        expect(response.body).toInclude({
          status: 'error',
          code: 'name-ownership-failure'
        });
      });
    });

  });
});
