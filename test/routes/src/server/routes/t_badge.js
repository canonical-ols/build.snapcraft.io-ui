//import { createHmac } from 'crypto';
import Express from 'express';
import supertest from 'supertest';
import nock from 'nock';
import expect from 'expect';
//import { EOL } from 'os';

import badge from '../../../../../src/server/routes/badge';
import { conf } from '../../../../../src/server/helpers/config.js';

describe('The badge endpoint', () => {
  const app = Express();

  let lpApi;

  app.use(badge);

  context('when there is no snap for given repo', () => {
    beforeEach(() => {
      const lp_api_url = conf.get('LP_API_URL');

      lpApi = nock(lp_api_url)
        .get('/devel/+snaps')
        .query({
          'ws.op': 'findByURL',
          url: 'https://github.com/anowner/aname'
        })
        .reply(404);
    });

    afterEach(() => {
      lpApi.done();
      nock.cleanAll();
    });

    it('shoud return an error', async () => {
      await supertest(app).get('/badge/anowner/aname').expect(404);
    });
  });

  context('when snap is available for given repo', () => {
    const lp_snap_user = 'test-user';
    const lp_snap_name = 'test-snap-name';

    const lp_snap_path = `/devel/~${lp_snap_user}/+snap/${lp_snap_name}`;
    const lp_builds_path = `${lp_snap_path}/builds`;

    const lp_api_url = conf.get('LP_API_URL');
    const lp_api_base = `${lp_api_url}/devel`;

    beforeEach(() => {

      lpApi = nock(lp_api_url)
        .get('/devel/+snaps')
        .query({
          'ws.op': 'findByURL',
          url: 'https://github.com/anowner/aname'
        })
        .reply(200, {
          total_size: 1,
          start: 0,
          entries: [{
            resource_type_link: `${lp_api_base}/#snap`,
            git_repository_url: 'https://github.com/anowner/aname',
            owner_link: `${lp_api_base}/~test-user`,
            builds_collection_link: `${lp_api_url}${lp_builds_path}`,
          }]
        });
    });

    afterEach(() => {
      lpApi.done();
      nock.cleanAll();
    });

    context('when there are builds for given repo', () => {
      beforeEach(() => {
        lpApi = lpApi.get(lp_builds_path)
          .query({ 'ws.start': 0, 'ws.size': 10 })
          .reply(200, {
            total_size: 1,
            start: 0,
            entries: [ {
              buildstate: 'Successfully built',
              store_upload_status: 'Uploaded'
            } ]
          });
      });

      it('shoud return a 200 OK', async () => {
        await supertest(app).get('/badge/anowner/aname').expect(200);
      });

      it('shoud return a SVG image with correct status', async () => {
        const response = await supertest(app).get('/badge/anowner/aname')
          .expect('Content-Type', 'image/svg+xml').buffer();

        const responseString = response.body.toString();

        expect(responseString).toInclude('built and published');
      });
    });

    context('when there are no builds for given repo', () => {
      beforeEach(() => {
        lpApi = lpApi
          .get(lp_builds_path)
          .query({ 'ws.start': 0, 'ws.size': 10 })
          .reply(200, {
            total_size: 0,
            start: 0,
            entries: []
          });
      });

      it('shoud return a 200 OK', async () => {
        await supertest(app).get('/badge/anowner/aname').expect(200);
      });

      it('shoud return a SVG image with `never built` status', async () => {
        const response = await supertest(app).get('/badge/anowner/aname')
          .expect('Content-Type', 'image/svg+xml').buffer();

        const responseString = response.body.toString();

        expect(responseString).toInclude('never built');
      });
    });
  });

});
