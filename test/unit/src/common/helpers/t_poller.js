import expect, { assert } from 'expect';
import nock from 'nock';
import sinon from 'sinon';

import { conf } from '../../../../../src/server/helpers/config';
import db from '../../../../../src/server/db';
import {
  checkSnapRepository,
  extractPartsToPoll,
  hasRepoChanged,
  pollRepositories,
  GitSourcePart
} from '../../../../../src/common/helpers/poller';


describe('Poller helpers', function() {

  afterEach(function() {
    nock.cleanAll();
  });

  describe('pollRepositories', function() {

    beforeEach(async () => {
      await db.model('GitHubUser').query('truncate').fetch();
      await db.model('Repository').query('truncate').fetch();
    });

    context('when there are no repositories', function() {
      it('does nothing', async () => {
        let checker = sinon.spy();
        let builder = sinon.spy();
        await pollRepositories(checker, builder);
        expect(checker.callCount).toBe(0);
        expect(builder.callCount).toBe(0);
      });
    });

    context('when the repository has no snapcraft.yaml', function() {
      it('gets skipped', () => {
        return db.transaction(async (trx) => {
          const db_user = db.model('GitHubUser').forge({
            github_id: 1234,
            name: null,
            login: 'person',
            last_login_at: new Date()
          });
          await db_user.save({}, { transacting: trx });
          const db_repo = db.model('Repository').forge({
            owner: 'anowner',
            name: 'aname',
            snapcraft_name: null,
            store_name: null,
            registrant_id: db_user.get('id')
          });
          await db_repo.save({}, { transacting: trx });
        }).then(async () => {
          let checker = sinon.spy();
          let builder = sinon.spy();
          await pollRepositories(checker, builder);
          expect(checker.callCount).toBe(0);
          expect(builder.callCount).toBe(0);
        });
      });
    });

    context('when the repository has name registered in the store', function() {
      it('gets skipped', () => {
        return db.transaction(async (trx) => {
          const db_user = db.model('GitHubUser').forge({
            github_id: 1234,
            name: null,
            login: 'person',
            last_login_at: new Date()
          });
          await db_user.save({}, { transacting: trx });
          const db_repo = db.model('Repository').forge({
            owner: 'anowner',
            name: 'aname',
            snapcraft_name: 'foo',
            store_name: null,
            registrant_id: db_user.get('id')
          });
          await db_repo.save({}, { transacting: trx });
        }).then(async () => {
          let checker = sinon.spy();
          let builder = sinon.spy();
          await pollRepositories(checker, builder);
          expect(checker.callCount).toBe(0);
          expect(builder.callCount).toBe(0);
        });
      });
    });

    context('when there are repositories with no changes', function() {
      it('gets checked, but not built', () => {
        return db.transaction(async (trx) => {
          const db_user = db.model('GitHubUser').forge({
            github_id: 1234,
            name: null,
            login: 'person',
            last_login_at: new Date()
          });
          await db_user.save({}, { transacting: trx });
          const db_repo = db.model('Repository').forge({
            owner: 'anowner',
            name: 'aname',
            snapcraft_name: 'foo',
            store_name: 'foo',
            registrant_id: db_user.get('id')
          });
          await db_repo.save({}, { transacting: trx });
        }).then(async () => {
          let checker = sinon.stub().returns(false);
          let builder = sinon.spy();
          await pollRepositories(checker, builder);
          expect(checker.callCount).toBe(1);
          expect(checker.calledWithMatch('anowner', 'aname')).toBe(true);
          expect(builder.callCount).toBe(0);
        });
      });
    });

    context('when there are repositories with changes', function() {
      it('gets built', () => {
        return db.transaction(async (trx) => {
          const db_user = db.model('GitHubUser').forge({
            github_id: 1234,
            name: null,
            login: 'person',
            last_login_at: new Date()
          });
          await db_user.save({}, { transacting: trx });
          const db_repo = db.model('Repository').forge({
            owner: 'anowner',
            name: 'aname',
            snapcraft_name: 'foo',
            store_name: 'foo',
            registrant_id: db_user.get('id')
          });
          await db_repo.save({}, { transacting: trx });
        }).then(async () => {
          let checker = sinon.stub().returns(true);
          let builder = sinon.spy();
          await pollRepositories(checker, builder);
          expect(checker.callCount).toBe(1);
          expect(checker.calledWithMatch('anowner', 'aname')).toBe(true);
          expect(builder.callCount).toBe(1);
          expect(builder.calledWith('anowner', 'aname')).toBe(true);
        });
      });
    });

  });


  describe('GitSourcePart helper class construction', function() {

    const repoUrl = 'https://github.com/anowner/aname';

    it('requires a git url', () => {
      expect(() => {new GitSourcePart();}).toThrow(
        'Required parameter: repoUrl');
    });

    it('can be constructed with just a git url', () => {
      var foo = new GitSourcePart(repoUrl);
      expect(foo.repoUrl).toEqual(repoUrl);
      expect(foo.branch).toEqual('master');
      expect(foo.tag).toEqual(null);
    });

    it('can be constructed with a git url and branch name', () => {
      var foo = new GitSourcePart(repoUrl, 'mybranch');
      expect(foo.repoUrl).toEqual(repoUrl);
      expect(foo.branch).toEqual('mybranch');
      expect(foo.tag).toEqual(null);
    });

    it('can be constructed with a git url and tag name', () => {
      var foo = new GitSourcePart(repoUrl, undefined, 'v1.0.0');
      expect(foo.repoUrl).toEqual(repoUrl);
      expect(foo.branch).toEqual('master');
      expect(foo.tag).toEqual('v1.0.0');
    });

    it('can be constructed with a git url and branch and tag name', () => {
      var foo = new GitSourcePart(repoUrl, 'mybranch', 'v1.0.0');
      expect(foo.repoUrl).toEqual(repoUrl);
      expect(foo.branch).toEqual('mybranch');
      expect(foo.tag).toEqual('v1.0.0');
    });
  });

  describe('GitSourcePart construction from snapcraft source part', () => {
    it('copes with missing parts', () => {
      var part = GitSourcePart.fromSnapcraftPart({});
      expect(part).toBe(undefined);
    });

    it('copes with missing source-type', () => {
      var part = GitSourcePart.fromSnapcraftPart(
        { source: 'https://github.com/foo/bar.git' });
      expect(part.repoUrl).toEqual('https://github.com/foo/bar.git');
      expect(part.branch).toEqual('master');
      expect(part.tag).toBe(undefined);
    });

    it('skips non-github repositories', () => {
      var part = GitSourcePart.fromSnapcraftPart(
        { source: 'https://git.launchpad.net/foo/bar.git' });
      expect(part).toBe(undefined);
    });

    it('extracts source-branch', () => {
      var part = GitSourcePart.fromSnapcraftPart(
        {
          'source': 'https://github.com/foo/bar.git',
          'source-branch': 'foo',
        });
      expect(part.repoUrl).toEqual('https://github.com/foo/bar.git');
      expect(part.branch).toEqual('foo');
      expect(part.tag).toBe(undefined);
    });

    it('does not support source-tag', () => {
      var part = GitSourcePart.fromSnapcraftPart(
        {
          'source': 'https://github.com/foo/bar.git',
          'source-tag': 'foo',
        });
      expect(part).toBe(undefined);
    });
  });


  describe('hasRepoChanged', function() {
    let ghApi;

    beforeEach(function() {
      ghApi = nock(conf.get('GITHUB_API_ENDPOINT'));
    });

    afterEach(function() {
      ghApi.done();
    });

    context('when there are changes', function() {
      const repositoryUrl = 'https://github.com/anowner/aname';

      beforeEach(function() {
        ghApi
          .get(/\/repos\/anowner\/aname\/commits\?since=2017-08-03T12%3A13%3A20\.000Z.*/)
          .reply(200, [ { sha: 'something' } ]);
      });

      it('returns true', async function() {
        const last_polled_at = 1501762400000;
        const changed = await hasRepoChanged(repositoryUrl, last_polled_at);
        expect(changed).toBe(true);
      });
    });

    context('when there are no changes', function() {
      const repositoryUrl = 'https://github.com/anowner/aname';

      beforeEach(function() {
        ghApi
          .get(/\/repos\/anowner\/aname\/commits\?since=.*/)
          .reply(200, []);
      });

      it('returns false', async function() {
        const last_polled_at = 1501762400000;
        const changed = await hasRepoChanged(repositoryUrl, last_polled_at);
        expect(changed).toBe(false);
      });
    });

    context('when repository lookup fails', function() {
      const repositoryUrl = 'https://github.com/anowner/aname';

      beforeEach(function() {
        ghApi
          .get(/\/repos\/anowner\/aname\/commits\?since=.*/)
          .reply(404, { message: 'Not Found' });
      });

      it('raises an error', async function() {
        try {
          const last_polled_at = 1501762400000;
          const changed = await hasRepoChanged(repositoryUrl, last_polled_at);
          assert(false, 'Expected error; got %s instead', changed);
        } catch (error) {
          expect(error.message).toBe(`${repositoryUrl} (404): Not Found`);
        }
      });
    });

    context('when last_polled_at is missing', function() {
      const repositoryUrl = 'https://github.com/anowner/aname';

      it('raises an error', async function() {
        try {
          const changed = await hasRepoChanged(repositoryUrl);
          assert(false, 'Expected error; got %s instead', changed);
        } catch (error) {
          expect(error.message).toBe('`last_polled_at` must be given.');
        }
      });
    });

    context('when last_polled_at is empty', function() {
      const repositoryUrl = 'https://github.com/anowner/aname';

      it('raises an error', async function() {
        try {
          const changed = await hasRepoChanged(repositoryUrl, '');
          assert(false, 'Expected error; got %s instead', changed);
        } catch (error) {
          expect(error.message).toBe('`last_polled_at` must be given.');
        }
      });
    });

  });

  describe('checkSnapRepository', function() {
    let ghApi;

    beforeEach(function() {
      ghApi = nock(conf.get('GITHUB_API_ENDPOINT'));
    });

    afterEach(function() {
      ghApi.done();
    });

    context('when there are changes in the snap repository', function() {

      beforeEach(function() {
        ghApi
          .get(/\/repos\/anowner\/aname\/commits.*/)
          .reply(200, [ { sha: 'some_sha' } ]);
      });

      it('returns true', async function() {
        const needs_build = await checkSnapRepository('anowner', 'aname', 1501762400000);
        expect(needs_build).toBe(true);
      });
    });

    context('when there are changes only in a part repository', function() {

      beforeEach(function() {
        ghApi
          .get(/\/repos\/anowner\/aname\/commits.*/)
          .reply(200, []);
        ghApi
          .get(/\/repos\/anowner\/aname\/contents.*/)
          .reply(200, 'parts:\n  foo:\n    source-type: git\n    ' +
                      'source: https://github.com/some/part.git');
        ghApi
          .get(/\/repos\/some\/part\/commits.*/)
          .reply(200, [ { sha: 'some-sha' } ]);

      });

      it('returns true', async function() {
        const needs_build = await checkSnapRepository('anowner', 'aname', 1501762400000);
        expect(needs_build).toBe(true);
      });
    });

    context('when there are no changes', function() {

      beforeEach(function() {
        ghApi
          .get(/\/repos\/anowner\/aname\/commits.*/)
          .reply(200, []);
        ghApi
          .get(/\/repos\/anowner\/aname\/contents.*/)
          .reply(200, 'parts:\n  foo:\n    source-type: git\n    ' +
                      'source: https://github.com/some/part.git');
        ghApi
          .get(/\/repos\/some\/part\/commits.*/)
          .reply(200, []);

      });

      it('returns false', async function() {
        const needs_build = await checkSnapRepository('anowner', 'aname', 1501762400000);
        expect(needs_build).toBe(false);
      });
    });

    context('when the snap branch is missing snapcraft.yaml', function() {

      beforeEach(function() {
        ghApi
          .get(/\/repos\/anowner\/aname\/commits.*/)
          .reply(200, []);
        ghApi
          .get(/\/repos\/anowner\/aname\/contents.*/)
          .reply(404, {});
      });

      it('returns false', async function() {
        const needs_build = await checkSnapRepository('anowner', 'aname', 1501762400000);
        expect(needs_build).toBe(false);
      });
    });


  });


  context('extractPartsToPoll', () => {

    it('copes with missing parts', () => {
      const snapcraft_yaml = {};
      const parts = extractPartsToPoll(snapcraft_yaml);
      expect(parts).toEqual([]);
    });

    it('copes with missing source-type', () => {
      const snapcraft_yaml = {
        parts: {
          simple: {
            source: 'https://github.com/foo/bar.git'
          }
        }
      };
      const parts = extractPartsToPoll(snapcraft_yaml);
      expect(parts.length).toEqual(1);
      expect(parts[0].repoUrl).toBe('https://github.com/foo/bar.git');
    });

    it('only extracts GH repos', () => {
      const snapcraft_yaml = {
        parts: {
          'gh': {
            'source': 'https://github.com/foo/bar.git'
          },
          'non-gh': {
            'source': 'https://code.launchpad.net/foo/bar.git'
          },
          'non-git': {
            'source': 'https://code.launchpad.net/foo/bar'
          },
          'gh-2': {
            'source': 'https://github.com/foo/zoing.git'
          }
        }
      };
      const parts = extractPartsToPoll(snapcraft_yaml);
      expect(parts.length).toBe(2);
      expect(parts[0].repoUrl).toEqual('https://github.com/foo/bar.git');
      expect(parts[1].repoUrl).toEqual('https://github.com/foo/zoing.git');
    });

  });
});
