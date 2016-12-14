// Snap Build data
//
// Parsed from API response in format:
// https://launchpad.net/+apidoc/devel.html#snap_build
// {
//   buildId: '1232', // last part of 'self_link'
//
//   buildLogUrl: '', // 'build_log_url'
//
//   // TODO: commit info (once available)
//   // username: 'John Doe',
//   // commitId:  'f1d6edb',
//   // commitMessage:  'Failed commit',
//
//   // TODO: use 'distro_arch_series.architecturetag' once available
//   architecture: 'i386', // last part of 'distro_arch_series_link'
//
//   // TODO: full list of statuses based on
//   // https://git.launchpad.net/launchpad/tree/lib/lp/buildmaster/enums.py#n22
//   status:  'error', // parsed based on 'buildstate' -> success, error, pending
//   statusMessage: 'Failed to build', // 'buildstate'
//
//   dateCreated: '2016-12-01T17:08:36.317805+00:00', // 'datecreated'
//   dateStarted: '2016-12-01T17:08:36.317805+00:00', // 'date_started'
//   dateFirstDispatched: '2016-12-01T17:08:36.317805+00:00', // 'date_first_dispatched'
//   dateCompleted: '2016-12-01T17:10:36.317805+00:00', // 'datebuilt'
//   duration: '0:02:00.124039' // 'duration'
// };


// Based on BuildStatus from LP API
// https://git.launchpad.net/launchpad/tree/lib/lp/buildmaster/enums.py#n22
const BuildStatus = {
  NEEDSBUILD: 'Needs building',     // pending
  FULLYBUILT: 'Successfully built', // success
  FAILEDTOBUILD:'Failed to build',  // error
  MANUALDEPWAIT: 'Dependency wait', // pending
  CHROOTWAIT: 'Chroot problem',     // error
  SUPERSEDED: 'Build for superseded Source', // error
  BUILDING: 'Currently building',   // pending
  FAILEDTOUPLOAD: 'Failed to upload', // error
  UPLOADING: 'Uploading build',     // pending
  CANCELLING: 'Cancelling build',   // pending
  CANCELLED: 'Cancelled build'      // error
};

// TODO:
// export enum with build status success/pending/error
// or export full list of statuses (like in API) and let view do the mapping?

const BuildStatusMapping = {
  [BuildStatus.NEEDSBUILD]: 'pending',
  [BuildStatus.FULLYBUILT]: 'success',
  [BuildStatus.FAILEDTOBUILD]: 'error',
  [BuildStatus.MANUALDEPWAIT]: 'pending',
  [BuildStatus.CHROOTWAIT]: 'error',
  [BuildStatus.SUPERSEDED]: 'error',
  [BuildStatus.BUILDING]: 'pending',
  [BuildStatus.FAILEDTOUPLOAD]: 'error',
  [BuildStatus.UPLOADING]: 'pending',
  [BuildStatus.CANCELLING]: 'pending',
  [BuildStatus.CANCELLED]: 'error'
};

function getLastPartOfUrl(url) {
  return url ? url.substr(url.lastIndexOf('/') + 1) : null;
}

// TODO:
// move out to some helper module?
export function snapBuildFromAPI(entry) {
  return {
    buildId: getLastPartOfUrl(entry.self_link),
    buildLogUrl: entry.build_log_url,

    architecture: getLastPartOfUrl(entry.distro_arch_series_link),

    status: BuildStatusMapping[entry.buildstate],
    statusMessage: entry.buildstate,

    dateCreated: entry.datecreated,
    dateStarted: entry.date_started,
    dateFirstDispatched: entry.date_first_dispatched,
    dateBuilt: entry.datebuilt,
    duration: entry.duration
  };
}
