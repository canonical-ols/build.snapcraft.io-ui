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
//   architecture: 'i386', //'arch_tag'
//
//   // https://git.launchpad.net/launchpad/tree/lib/lp/buildmaster/enums.py#n22
//   status:  'error', // parsed based on 'buildstate' -> success, error, pending
//   statusMessage: 'Failed to build', // 'buildstate'
//
//   dateCreated: '2016-12-01T17:08:36.317805+00:00', // 'datecreated'
//   dateStarted: '2016-12-01T17:08:36.317805+00:00', // 'date_started'
//   dateCompleted: '2016-12-01T17:10:36.317805+00:00', // 'datebuilt'
//   duration: '0:02:00.124039' // 'duration'
// };

export const BuildStatusColours = {
  BLUE: 'blue',
  GREEN: 'green',
  YELLOW: 'yellow',
  RED: 'red',
  GREY: 'grey'
};

const BuildAndPubState = {
  'NEVER_BUILT':     createState('Never built', BuildStatusColours.GREY, false, 8),
  'BUILDING_SOON':   createState('Building soon', BuildStatusColours.GREY, 'ellipsis', 7),
  'IN_PROGRESS':     createState('In progress', BuildStatusColours.BLUE, 'spinner', 2),
  'FAILED_TO_BUILD': createState('Failed to build', BuildStatusColours.RED, 'cross', 1),
  'WONT_PUBLISH':    createState('Built, won\'t be published', BuildStatusColours.GREEN, 'tick_outlined', 6),
  'PUBLISHING_SOON':    createState('Built, publishing soon', BuildStatusColours.GREY, 'tick', 2),
  'PUBLISHING_NOW':     createState('Built, publishing now', BuildStatusColours.BLUE, 'tick', 3),
  'PUBLISHING_FAILED':  createState('Built, failed to publish', BuildStatusColours.RED, 'tick', 4),
  'PUBLISHED':       createState('Built and published', BuildStatusColours.GREEN, 'tick_filled', 5)
};

function createState(message, colour, icon, priority) {
  return {
    message,
    colour,
    icon,
    priority
  };
}

// Based on BuildStatusConstants from LP API
// https://git.launchpad.net/launchpad/tree/lib/lp/buildmaster/enums.py#n22
//
const LaunchpadBuildStates = {
  'NEEDSBUILT': 'Needs building',
  'FULLYBUILT': 'Successfully built',
  'FAILEDTOBUILD': 'Failed to build',
  'MANUALDEPWAIT': 'Dependency wait',
  'CHROOTWAIT': 'Chroot problem',
  'SUPERSEDED': 'Build for superseded Source',
  'BUILDING': 'Currently building',
  'FAILEDTOUPLOAD': 'Failed to upload',
  'UPLOADING': 'Uploading build',
  'CANCELLING': 'Cancelling build',
  'CANCELLED': 'Cancelled build'
};

const LaunchpadStoreUploadStates = {
  'UNSCHEDULED': 'Unscheduled',
  'PENDING': 'Pending',
  'FAILED_UPLOAD': 'Failed to upload',
  'FAILED_RELEASE': 'Failed to release to channels',
  'UPLOADED': 'Uploaded'
};

function mapBuildAndPublishedStates(buildState, publishState) {
  switch (buildState) {
    case LaunchpadBuildStates.NEEDSBUILT:
      return BuildAndPubState.NEVER_BUILT;
    case LaunchpadBuildStates.FULLYBUILT:
      return internalMapPublishState(publishState);
    case LaunchpadBuildStates.FAILEDTOBUILD:
      return BuildAndPubState.FAILED;
    case LaunchpadBuildStates.MANUALDEPWAIT:
      return BuildAndPubState.SOON;
    case LaunchpadBuildStates.BUILDING:
      return BuildAndPubState.IN_PROGRESS;
    case LaunchpadBuildStates.UPLOADING:
      return BuildAndPubState.PUBLISHING_NOW;
  }
}

function internalMapPublishState(publishState) {
  switch (publishState) {
    case LaunchpadStoreUploadStates.UNSCHEDULED:
      return BuildAndPubState.WONT_PUBLISH;
    case LaunchpadStoreUploadStates.PENDING:
      return BuildAndPubState.PUBLISHING_SOON;
    case LaunchpadStoreUploadStates.FAILED_UPLOAD:
    case LaunchpadStoreUploadStates.FAILED_RELEASE:
      return BuildAndPubState.PUBLISHING_FAILED;
    case LaunchpadStoreUploadStates.UPLOADED:
      return BuildAndPubState.BUILT;
  }
}


function getLastPartOfUrl(url) {
  return url ? url.substr(url.lastIndexOf('/') + 1) : null;
}

export function snapBuildFromAPI(entry) {

  const [ colour, statusMessage ] = mapBuildAndPublishedStates(entry.buildstate, entry.store_upload_status);

  return entry ? {
    buildId: getLastPartOfUrl(entry.self_link),
    buildLogUrl: entry.build_log_url,

    architecture: entry.arch_tag,

    colour: colour,
    statusMessage: statusMessage,

    dateCreated: entry.datecreated,
    dateStarted: entry.date_started,
    dateBuilt: entry.datebuilt,
    duration: entry.duration,

    storeRevision: entry.store_upload_revision
  } : null;
}
