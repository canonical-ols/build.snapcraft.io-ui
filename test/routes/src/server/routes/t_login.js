import Express from 'express';
import nock from 'nock';
import supertest from 'supertest';
import url from 'url';

import login from '../../../../../src/server/routes/login';
import { conf } from '../../../../../src/server/helpers/config';

const UBUNTU_SSO_URL = conf.get('UBUNTU_SSO_URL');
const OPENID_VERIFY_URL = conf.get('OPENID_VERIFY_URL');

describe('login routes', () => {
  const app = Express();
  app.use((req, res, next) => {
    req.session = {};
    next();
  });
  app.use(login);

  beforeEach(() => {
    nock(UBUNTU_SSO_URL)
      .get('/')
      .reply(
        200, [
          '<?xml version="1.0"?>',
          '<xrds:XRDS',
          '    xmlns="xri://$xrd*($v*2.0)"',
          '    xmlns:xrds="xri://$xrds">',
          '  <XRD>',
          '    <Service priority="0">',
          '      <Type>http://specs.openid.net/auth/2.0/server</Type>',
          '      <Type>http://openid.net/srv/ax/1.0</Type>',
          '      <Type>http://openid.net/extensions/sreg/1.1</Type>',
          '      <Type>http://ns.launchpad.net/2007/openid-teams</Type>',
          '      <Type>http://ns.login.ubuntu.com/2016/openid-macaroon</Type>',
          `      <URI>${UBUNTU_SSO_URL}/+openid</URI>`,
          '    </Service>',
          '  </XRD>',
          '</xrds:XRDS>'
        ].join('\n') + '\n',
        { 'Content-Type': 'application/xrds+xml' });
    nock(UBUNTU_SSO_URL)
      .post('/+openid')
      .reply(
        200, [
          'assoc_handle:{HMAC-SHA256}{5855f159}{F2z7DQ==}',
          'assoc_type:HMAC-SHA256',
          // Fixed mock keys for testing.  We just need to get far enough to
          // get past openid.associate.
          'dh_server_public:AMZnmSsNwiqdfff0SpwNjW/rILcNfCym/bLP5khI3wI7XcZxB8mJk6JqE3+KR3uAisTa3qgR/2mFYN4ruD8lS5rdJnkXnLAqGrpQDUTKlzxB/Nk5w3XvsJkslmeTtka+h8lMIypY+m3tOiTYKR+pkX++OHsLwRldC6qxJH0ZWTat',
          'enc_mac_key:RMGAA+oKkhayYZlqmxt2E7BmjVyO5eyMULQyD9ZEXvc=',
          'expires_in:1209600',
          'ns:http://specs.openid.net/auth/2.0',
          'session_type:DH-SHA256'
        ].join('\n') + '\n');
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('authenticate', () => {
    context('with no options', () => {
      it('should redirect from /login/authenticate to SSO', (done) => {
        supertest(app)
          .get('/login/authenticate')
          .expect(res => {
            const loc = res.header['location'];
            if (!loc.startsWith(UBUNTU_SSO_URL)) {
              throw new Error(
                `Location header ${loc} does not start with ${UBUNTU_SSO_URL}`);
            }
          })
          .expect(302, done);
      });

      it('should include verify url in redirect header', (done) => {
        supertest(app)
          .get('/login/authenticate')
          .expect(res => {
            const parsedLocation = url.parse(res.header['location'], true);
            const returnTo = parsedLocation.query['openid.return_to'];
            if (returnTo !== OPENID_VERIFY_URL) {
              throw new Error(
                `openid.return_to is ${returnTo}, ` +
                `expected ${OPENID_VERIFY_URL}`);
            }
          })
          .end(done);
      });

      it('should not include macaroon extension in redirect ' +
         'header', (done) => {
        supertest(app)
          .get('/login/authenticate')
          .expect(res => {
            const parsedLocation = url.parse(res.header['location'], true);
            if ('openid.ns.macaroon' in parsedLocation.query) {
              throw new Error('query string contains openid.ns.macaroon');
            }
            if ('openid.macaroon.caveat_id' in parsedLocation.query) {
              throw new Error('query string contains ' +
                              'openid.macaroon.caveat_id');
            }
          })
          .end(done);
      });
    });

    context('with options', () => {
      it('should redirect from /login/authenticate to SSO', (done) => {
        supertest(app)
          .get('/login/authenticate')
          .query({ 'starting_url': 'http://www.example.com/origin' })
          .query({ 'caveat_id': 'dummy caveat' })
          .expect(res => {
            const loc = res.header['location'];
            if (!loc.startsWith(UBUNTU_SSO_URL)) {
              throw new Error(
                `Location header ${loc} does not start with ${UBUNTU_SSO_URL}`);
            }
          })
          .expect(302, done);
      });

      it('should include verify url in redirect header', (done) => {
        supertest(app)
          .get('/login/authenticate')
          .query({ 'starting_url': 'http://www.example.com/origin' })
          .query({ 'caveat_id': 'dummy caveat' })
          .expect(res => {
            const parsedLocation = url.parse(res.header['location'], true);
            const returnTo = parsedLocation.query['openid.return_to'];
            const expectedReturnTo =
              OPENID_VERIFY_URL +
              '?starting_url=http%3A%2F%2Fwww.example.com%2Forigin' +
              '&caveat_id=dummy%20caveat';
            if (returnTo !== expectedReturnTo) {
              throw new Error(
                `openid.return_to is ${returnTo}, ` +
                `expected ${expectedReturnTo}`);
            }
          })
          .end(done);
      });

      it('should include macaroon extension in redirect header', (done) => {
        const expectedCaveatId = 'dummy caveat';
        supertest(app)
          .get('/login/authenticate')
          .query({ 'starting_url': 'http://www.example.com/origin' })
          .query({ 'caveat_id': expectedCaveatId })
          .expect(res => {
            const parsedLocation = url.parse(res.header['location'], true);
            const nsMacaroon = parsedLocation.query['openid.ns.macaroon'];
            const expectedNsMacaroon =
              'http://ns.login.ubuntu.com/2016/openid-macaroon';
            if (nsMacaroon !== expectedNsMacaroon) {
              throw new Error(
                `openid.ns.macaroon is ${nsMacaroon}, ` +
                `expected ${expectedNsMacaroon}`);
            }
            const caveatId = parsedLocation.query['openid.macaroon.caveat_id'];
            if (caveatId !== expectedCaveatId) {
              throw new Error(
                `openid.macaroon.caveat_id is ${caveatId}, ` +
                `expected ${expectedCaveatId}`);
            }
          })
          .end(done);
      });
    });
  });
});
