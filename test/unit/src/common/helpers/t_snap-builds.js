import expect from 'expect';

import {
  snapBuildFromAPI,
  BuildStatus,
  BuildStatusLP
} from '../../../../../src/common/helpers/snap-builds';


describe('snapBuildFromAPI helper', () => {
  const SNAP_BUILD_ENTRY = {
    'can_be_rescored': false,
    'builder_link': 'https://api.launchpad.net/devel/builders/lgw01-11',
    'datebuilt': '2016-11-09T17:08:36.317805+00:00',
    'distro_arch_series_link': 'https://api.launchpad.net/devel/ubuntu/xenial/amd64',
    'snap_link': 'https://api.launchpad.net/devel/~cjwatson/+snap/godd-test-2',
    'duration': '0:02:36.314039',
    'can_be_cancelled': false,
    'title': 'amd64 build of godd-test-2 snap package in ubuntu xenial-updates',
    'buildstate': 'Currently building',
    'requester_link': 'https://api.launchpad.net/devel/~cjwatson',
    'http_etag': '\'d4a5173d51d6525b6d07709306bcfd65dbb68c5c-303718749dd6021eaf21d1a9eb4ae538de800de2\'',
    'score': null,
    'self_link': 'https://api.launchpad.net/devel/~cjwatson/+snap/godd-test-2/+build/9590',
    'date_started': '2016-11-09T17:06:00.003766+00:00',
    'resource_type_link': 'https://api.launchpad.net/devel/#snap_build',
    'build_log_url': 'https://launchpad.net/~cjwatson/+snap/godd-test-2/+build/9590/+files/buildlog_snap_ubuntu_xenial_amd64_godd-test-2_BUILDING.txt.gz',
    'pocket': 'Updates',
    'dependencies': null,
    'date_first_dispatched': '2016-11-09T17:06:00.003766+00:00',
    'distribution_link': 'https://api.launchpad.net/devel/ubuntu',
    'distro_series_link': 'https://api.launchpad.net/devel/ubuntu/xenial',
    'web_link': 'https://launchpad.net/~cjwatson/+snap/godd-test-2/+build/9590',
    'datecreated': '2016-11-09T17:05:52.436792+00:00',
    'archive_link': 'https://api.launchpad.net/devel/ubuntu/+archive/primary',
    'upload_log_url': null
  };

  let snapBuild;

  context('when passed a valid snap build entry object', () => {

    beforeEach(() => {
      snapBuild = snapBuildFromAPI(SNAP_BUILD_ENTRY);
    });

    it('should return an object containing all expected fields', () => {
      expect(snapBuild).toIncludeKeys([
        'buildId',
        'buildLogUrl',

        'architecture',

        'status',
        'statusMessage',

        'dateCreated',
        'dateStarted',
        'dateBuilt',
        'duration',
      ]);
    });

    it('should parse buildId from self_link field', () => {
      // 'self_link': 'https://api.launchpad.net/devel/~cjwatson/+snap/godd-test-2/+build/9590',
      expect(snapBuild.buildId).toEqual('9590');
    });

    it('should take buildLogUrl from build_log_url field', () => {
      expect(snapBuild.buildLogUrl).toEqual(SNAP_BUILD_ENTRY.build_log_url);
    });

    it('should parse architecture from distro_arch_series_link field', () => {
      // 'distro_arch_series_link': 'https://api.launchpad.net/devel/ubuntu/xenial/amd64',
      expect(snapBuild.architecture).toEqual('amd64');
    });

    it('should take statusMessage from buildstate field', () => {
      expect(snapBuild.statusMessage).toEqual(SNAP_BUILD_ENTRY.buildstate);
    });

    it('should take dateCreated from datecreated field', () => {
      expect(snapBuild.dateCreated).toEqual(SNAP_BUILD_ENTRY.datecreated);
    });

    it('should take dateStarted from date_started field', () => {
      expect(snapBuild.dateStarted).toEqual(SNAP_BUILD_ENTRY.date_started);
    });

    it('should take dateBuilt from datebuilt field', () => {
      expect(snapBuild.dateBuilt).toEqual(SNAP_BUILD_ENTRY.datebuilt);
    });

    it('should take duration from duration field', () => {
      expect(snapBuild.duration).toEqual(SNAP_BUILD_ENTRY.duration);
    });

  });

  context('when passed an empty object', () => {

    it('should return null', () => {
      expect(snapBuildFromAPI(null)).toBe(null);
    });

  });

  context('when mapping build states', () => {

    it('should map NEEDSBUILD into PENDING', () => {
      const entry = {
        ...SNAP_BUILD_ENTRY,
        buildstate: BuildStatusLP.NEEDSBUILD
      };

      expect(snapBuildFromAPI(entry).status).toEqual(BuildStatus.PENDING);
    });

    it('should map FULLYBUILT into SUCCESS', () => {
      const entry = {
        ...SNAP_BUILD_ENTRY,
        buildstate: BuildStatusLP.FULLYBUILT
      };

      expect(snapBuildFromAPI(entry).status).toEqual(BuildStatus.SUCCESS);
    });

    it('should map FAILEDTOBUILD into ERROR', () => {
      const entry = {
        ...SNAP_BUILD_ENTRY,
        buildstate: BuildStatusLP.FAILEDTOBUILD
      };

      expect(snapBuildFromAPI(entry).status).toEqual(BuildStatus.ERROR);
    });

    it('should map MANUALDEPWAIT into PENDING', () => {
      const entry = {
        ...SNAP_BUILD_ENTRY,
        buildstate: BuildStatusLP.MANUALDEPWAIT
      };

      expect(snapBuildFromAPI(entry).status).toEqual(BuildStatus.PENDING);
    });

    it('should map CHROOTWAIT into ERROR', () => {
      const entry = {
        ...SNAP_BUILD_ENTRY,
        buildstate: BuildStatusLP.CHROOTWAIT
      };

      expect(snapBuildFromAPI(entry).status).toEqual(BuildStatus.ERROR);
    });

    it('should map SUPERSEDED into ERROR', () => {
      const entry = {
        ...SNAP_BUILD_ENTRY,
        buildstate: BuildStatusLP.SUPERSEDED
      };

      expect(snapBuildFromAPI(entry).status).toEqual(BuildStatus.ERROR);
    });

    it('should map BUILDING into PENDING', () => {
      const entry = {
        ...SNAP_BUILD_ENTRY,
        buildstate: BuildStatusLP.BUILDING
      };

      expect(snapBuildFromAPI(entry).status).toEqual(BuildStatus.PENDING);
    });

    it('should map FAILEDTOUPLOAD into ERROR', () => {
      const entry = {
        ...SNAP_BUILD_ENTRY,
        buildstate: BuildStatusLP.FAILEDTOUPLOAD
      };

      expect(snapBuildFromAPI(entry).status).toEqual(BuildStatus.ERROR);
    });

    it('should map UPLOADING into PENDING', () => {
      const entry = {
        ...SNAP_BUILD_ENTRY,
        buildstate: BuildStatusLP.UPLOADING
      };

      expect(snapBuildFromAPI(entry).status).toEqual(BuildStatus.PENDING);
    });

    it('should map CANCELLING into PENDING', () => {
      const entry = {
        ...SNAP_BUILD_ENTRY,
        buildstate: BuildStatusLP.CANCELLING
      };

      expect(snapBuildFromAPI(entry).status).toEqual(BuildStatus.ERROR);
    });

    it('should map CANCELLED into ERROR', () => {
      const entry = {
        ...SNAP_BUILD_ENTRY,
        buildstate: BuildStatusLP.CANCELLED
      };

      expect(snapBuildFromAPI(entry).status).toEqual(BuildStatus.ERROR);
    });

  });

});
