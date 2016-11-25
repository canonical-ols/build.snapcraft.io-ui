/* Copyright 2011-2016 Canonical Ltd.  This software is licensed under the
 * GNU Affero General Public License version 3 (see the file LICENSE).
 */

import expect, { assert } from 'expect';
import nock from 'nock';

import { conf } from '../../../../../src/server/helpers/config';
import {
  Collection,
  Entry
} from '../../../../../src/server/launchpad/client';
import getLaunchpad from '../../../../../src/server/launchpad';

const LP_API_URL = conf.get('LP_API_URL');

describe('Collection', () => {
  let lp;

  beforeEach(() => {
    lp = nock(LP_API_URL)
      .defaultReplyHeaders({ 'Content-Type': 'application/json' });
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('defines entries based on the given representation', () => {
    const representation = {
      total_size: 2,
      start: 0,
      entries: [{ name: 'one' }, { name: 'two' }]
    };
    const collection = new Collection(
      getLaunchpad(), representation, `${LP_API_URL}/api/devel/~foo/ppas`);
    expect(collection.total_size).toEqual(2);
    expect(collection.entries.length).toEqual(2);
    expect(collection.entries[0].name).toEqual('one');
    expect(collection.entries[1].name).toEqual('two');
  });

  it('retrieves a subset of the collection', () => {
    let entries = [];
    for (let i = 0; i < 100; i++) {
      entries.push({ name: `person${i}` });
    }

    lp.get('/api/devel/~foo/ppas')
      .query({ 'ws.start': 75, 'ws.size': 25 })
      .reply(200, {
        total_size: entries.length,
        start: 75,
        prev_collection_link: `${LP_API_URL}/api/devel/~foo/ppas?ws.size=75`,
        entries: entries.slice(75, 100)
      });

    const representation = {
      total_size: entries.length,
      start: 0,
      next_collection_link:
        `${LP_API_URL}/api/devel/~foo/ppas?ws.start=75&ws.size=75`,
      entries: entries.slice(0, 75)
    };
    const collection = new Collection(
      getLaunchpad(), representation, `${LP_API_URL}/api/devel/~foo/ppas`);
    expect(collection.total_size).toEqual(100);
    expect(collection.entries.length).toEqual(75);
    return collection.lp_slice(75, 25).then(slice => {
      expect(slice.entries.length).toEqual(25);
      expect(slice.entries[0].name).toEqual('person75');
      expect(slice.entries[24].name).toEqual('person99');
    });
  });
});

describe('Entry', () => {
  let lp;

  beforeEach(() => {
    lp = nock(LP_API_URL)
      .defaultReplyHeaders({ 'Content-Type': 'application/json' });
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('defines properties based on the given representation', () => {
    const representation = {
      resource_type_link: `${LP_API_URL}/api/devel/#person`,
      name: 'foo'
    };
    const entry = new Entry(
      getLaunchpad(), representation, `${LP_API_URL}/api/devel/~foo`);
    expect(entry.resource_type_link)
      .toEqual(`${LP_API_URL}/api/devel/#person`);
    expect(entry.name).toEqual('foo');
  });

  it('saves modified attributes', () => {
    lp.post('/api/devel/~foo', { 'display_name': 'Bar' })
      .matchHeader('X-HTTP-Method-Override', /^PATCH$/)
      .reply(200, {
        resource_type_link: `${LP_API_URL}/api/devel/#person`,
        self_link: `${LP_API_URL}/api/devel/~foo`,
        name: 'foo',
        display_name: 'Bar'
      });

    const representation = {
      http_etag: 'test-etag',
      resource_type_link: `${LP_API_URL}/api/devel/#person`,
      self_link: `${LP_API_URL}/api/devel/~foo`,
      name: 'foo',
      display_name: 'Foo'
    };
    let entry = new Entry(
      getLaunchpad(), representation, `${LP_API_URL}/api/devel/~foo`);
    entry.display_name = 'Bar';
    expect(entry.dirty_attributes).toEqual(['display_name']);
    return entry.lp_save()
      .then(() => { expect(entry.dirty_attributes).toEqual([]); });
  });
});

/* Check an Authorization header. */
function checkAuthorization(val) {
  if (!val.toString().startsWith('OAuth ')) {
    return false;
  }
  let params = {};
  for (const param of val.toString().slice('OAuth '.length).split(',')) {
    const parts = param.trim().split('=', 2);
    params[parts[0]] = decodeURIComponent(parts[1].replace(/^"(.*)"$/, '$1'));
  }
  return (
    params['oauth_version'] === '1.0' &&
    params['oauth_consumer_key'] === 'consumer key' &&
    params['oauth_signature_method'] === 'PLAINTEXT' &&
    params['oauth_token'] === 'token key' &&
    params['oauth_signature'] === '&token%20secret');
}

describe('Launchpad', () => {
  let lp;

  beforeEach(() => {
    conf.add('t_client', {
      type: 'literal',
      store: {
        'LP_API_CONSUMER_KEY': 'consumer key',
        'LP_API_TOKEN': 'token key',
        'LP_API_TOKEN_SECRET': 'token secret'
      }
    });
    lp = nock(LP_API_URL)
      .defaultReplyHeaders({ 'Content-Type': 'application/json' });
  });

  afterEach(() => {
    nock.cleanAll();
    conf.remove('t_client');
  });

  describe('get', () => {
    it('handles successful response', () => {
      lp.get('/api/devel/people')
        .matchHeader('Authorization', checkAuthorization)
        .matchHeader('Accept', /^application\/json$/)
        .reply(200, { entry: { resource_type_link: 'foo' } });

      return getLaunchpad().get('/people').then(result => {
        expect(result.entry).toBeA(Entry);
        expect(result.entry.resource_type_link).toEqual('foo');
      });
    });

    it('handles failing response', () => {
      lp.get('/api/devel/people').reply(503);

      return getLaunchpad().get('/people').then(result => {
        assert(false, 'Expected promise to be rejected; got %s instead',
               result);
      }, error => {
        expect(error.response.status).toEqual(503);
        expect(error.uri).toEqual(
          'https://api.staging.launchpad.net/api/devel/people');
      });
    });
  });

  describe('named_get', () => {
    it('handles successful response', () => {
      lp.get('/api/devel/people')
        .query({ 'ws.op': 'getByEmail', 'email': 'foo@example.com' })
        .matchHeader('Authorization', checkAuthorization)
        .matchHeader('Accept', /^application\/json$/)
        .reply(200, {
          resource_type_link: `${LP_API_URL}/api/devel/#person`,
          name: 'foo'
        });

      return getLaunchpad().named_get(
        '/people', 'getByEmail', { parameters: { email: 'foo@example.com' } })
        .then(result => {
          expect(result).toBeA(Entry);
          expect(result.name).toEqual('foo');
        });
    });

    it('handles failing response', () => {
      lp.get('/api/devel/people').query({ 'ws.op': 'getByEmail' }).reply(503);

      return getLaunchpad().named_get('/people', 'getByEmail').then(result => {
        assert(false, 'Expected promise to be rejected; got %s instead',
               result);
      }, error => {
        expect(error.response.status).toEqual(503);
        expect(error.uri).toEqual(
          'https://api.staging.launchpad.net/api/devel/people?' +
          'ws.op=getByEmail');
      });
    });
  });

  describe('named_post', () => {
    it('handles successful response', () => {
      lp.post('/api/devel/people', { 'ws.op': 'newTeam' })
        .matchHeader('Authorization', checkAuthorization)
        .reply(200, { entry: { resource_type_link: 'foo' } });

      return getLaunchpad().named_post('/people', 'newTeam').then(result => {
        expect(result.entry).toBeA(Entry);
        expect(result.entry.resource_type_link).toEqual('foo');
      });
    });

    it('handles factory response', () => {
      lp.post('/api/devel/people', { 'ws.op': 'newTeam', 'name': 'foo' })
        .matchHeader('Authorization', checkAuthorization)
        .reply(201, '', { 'Location': `${LP_API_URL}/api/devel/~foo` });
      lp.get('/api/devel/~foo')
        .reply(200, {
          resource_type_link: `${LP_API_URL}/api/devel/#team`,
          name: 'foo'
        });

      return getLaunchpad().named_post(
        '/people', 'newTeam', { parameters: { name: 'foo' } })
        .then(result => {
          expect(result).toBeA(Entry);
          expect(result.name).toEqual('foo');
        });
    });

    it('handles failing response', () => {
      lp.post('/api/devel/people').reply(503);

      return getLaunchpad().named_post('/people', 'newTeam').then(result => {
        assert(false, 'Expected promise to be rejected; got %s instead',
               result);
      }, error => {
        expect(error.response.status).toEqual(503);
        expect(error.uri).toEqual(
          'https://api.staging.launchpad.net/api/devel/people');
      });
    });
  });

  describe('patch', () => {
    it('handles successful response', () => {
      lp.post('/api/devel/~foo', { 'display_name': 'Foo' })
        .matchHeader('Authorization', checkAuthorization)
        .matchHeader('Accept', /^application\/json$/)
        .matchHeader('X-HTTP-Method-Override', /^PATCH$/)
        .matchHeader('X-Content-Type-Override', /^application\/json$/)
        .reply(200, {
          resource_type_link: `${LP_API_URL}/api/devel/#person`,
          name: 'foo',
          display_name: 'Foo'
        });

      return getLaunchpad().patch('/~foo', { 'display_name': 'Foo' })
        .then(result => {
          expect(result).toBeA(Entry);
          expect(result.display_name).toEqual('Foo');
        });
    });

    it('handles failing response', () => {
      lp.post('/api/devel/~foo').reply(503);

      return getLaunchpad().patch('/~foo', { 'display_name': 'Foo' })
        .then(result => {
          assert(false, 'Expected promise to be rejected; got %s instead',
                 result);
        }, error => {
          expect(error.response.status).toEqual(503);
          expect(error.uri).toEqual(
            'https://api.staging.launchpad.net/api/devel/~foo');
        });
    });
  });

  describe('wrap_resource', () => {
    it('produces mappings of plain object literals', () => {
      const result = getLaunchpad().wrap_resource(null, {
        baa: {},
        bar: { baz: { resource_type_link: 'qux' } }
      });
      expect(result.bar.baz).toBeA(Entry);
    });

    it('produces arrays of array literals', () => {
      const result = getLaunchpad().wrap_resource(null, [
        [{ resource_type_link: 'qux' }]
      ]);
      expect(result[0][0]).toBeA(Entry);
    });

    it('creates a new array rather than reusing the existing one', () => {
      let foo = ['a'];
      const bar = getLaunchpad().wrap_resource(null, foo);
      expect(bar).toNotBe(foo);
    });

    it('creates a new object rather than reusing the existing one', () => {
      let foo = { a: 'b' };
      const bar = getLaunchpad().wrap_resource(null, foo);
      expect(bar).toNotBe(foo);
    });

    it('handles null correctly', () => {
      const result = getLaunchpad().wrap_resource(null, { bar: null });
      expect(result.bar).toBe(null);
    });
  });

  describe('wrap_resource_on_success', () => {
    const original_uri = 'https://api.staging.launchpad.net/original_uri';
    const updated_uri = 'https://api.staging.launchpad.net/object_uri';
    const fake_response = {
      headers: {
        get: key => {
          switch (key) {
            case 'Content-Type':
              return 'application/json';
            default:
              return null;
          }
        }
      },
      json: () => {
        return Promise.resolve({
          self_link: updated_uri,
          resource_type_link: 'object'
        });
      }
    };

    it('does not modify URI on PATCH', () => {
      return getLaunchpad().wrap_resource_on_success(
        fake_response, original_uri, 'PATCH')
        .then(result => {
          expect(result.uri).toEqual(original_uri);
        });
    });

    it('replaces the URI on POST with the value of self_link', () => {
      return getLaunchpad().wrap_resource_on_success(
        fake_response, original_uri, 'POST')
        .then(result => {
          expect(result.uri).toEqual(updated_uri);
        });
    });
  });
});
