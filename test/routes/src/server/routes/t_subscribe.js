import expect from 'expect';
import Express from 'express';
import nock from 'nock';
import supertest from 'supertest';
import url from 'url';

import {
  MAILCHIMP_FORM_URL,
  MAILCHIMP_FORM_U,
  MAILCHIMP_FORM_ID
} from '../../../../../src/server/handlers/subscribe';

import subscribe from '../../../../../src/server/routes/subscribe';

describe('The subscribe API endpoint', () => {
  const app = Express();
  app.use(subscribe);

  const formUrl = url.parse(MAILCHIMP_FORM_URL);
  const mailchimpUrl = url.format({
    protocol: formUrl.protocol,
    host: formUrl.host
  });

  describe('private-repos route', () => {

    afterEach(() => {
      nock.cleanAll();
    });

    it('passes request through to mailchimp', async () => {
      const scope = nock(mailchimpUrl)
        .get(formUrl.pathname)
        .query({
          u: MAILCHIMP_FORM_U,
          id: MAILCHIMP_FORM_ID,
          EMAIL: 'test@email.com'
        })
        .reply(200, { result: 'success', message: 'Done.' });

      const res = await supertest(app)
        .get('/subscribe/private-repos')
        .query({
          email: 'test@email.com'
        });

      scope.done();
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ result: 'success', message: 'Done.' });
    });

  });

});
