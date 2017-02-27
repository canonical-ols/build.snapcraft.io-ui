import 'isomorphic-fetch';
import localforage from 'localforage';
import { MacaroonsBuilder } from 'macaroons.js';

import { APICompatibleError, checkStatus, getError } from '../helpers/api';
import { conf } from '../helpers/config';
import { checkPackageUploadRequest, getAccountInfo } from './auth-store';
import { requestBuilds } from './snap-builds';

const BASE_URL = conf.get('BASE_URL');

export const REGISTER_NAME = 'REGISTER_NAME';
export const REGISTER_NAME_SUCCESS = 'REGISTER_NAME_SUCCESS';
export const REGISTER_NAME_ERROR = 'REGISTER_NAME_ERROR';

// XXX cjwatson 2017-02-08: Hardcoded for now, but should eventually be
// configurable.
const STORE_SERIES = '16';
const STORE_CHANNELS = ['edge'];

export function getPackageUploadRequestMacaroon() {
  return localforage.getItem('package_upload_request')
    .catch(() => null)
    .then((packageUploadRequest) => {
      if (packageUploadRequest === null) {
        throw new APICompatibleError({
          code: 'not-logged-into-store',
          message: 'Not logged into store',
          detail: 'No package_upload_request macaroons in local storage'
        });
      }
      let macaroons;
      try {
        macaroons = checkPackageUploadRequest(
          packageUploadRequest.root, packageUploadRequest.discharge
        );
      } catch (e) {
        throw new APICompatibleError({
          code: 'not-logged-into-store',
          message: 'Not logged into store',
          detail: `Checking package_upload_request macaroons failed: ${e}`
        });
      }
      const root = macaroons.root.serialize();
      const discharge = MacaroonsBuilder.modify(macaroons.root)
        .prepare_for_request(macaroons.discharge)
        .getMacaroon()
        .serialize();
      return { root, discharge };
    });
}

function signAgreement(root, discharge) {
  return fetch(`${BASE_URL}/api/store/agreement`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      latest_tos_accepted: true,
      root,
      discharge
    })
  })
    .then((response) => {
      if (response.status >= 200 && response.status < 300) {
        return null;
      } else {
        return response.json().then((json) => {
          const payload = json.error_list ? json.error_list[0] : json;
          throw getError(response, { status: 'error', payload });
        });
      }
    });
}

export function internalRegisterName(root, discharge, snapName, repositoryUrl) {
  return fetch(`${BASE_URL}/api/store/register-name`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      snap_name: snapName,
      repository_url: repositoryUrl,
      root,
      discharge
    })
  })
    .then((response) => {
      if (response.status >= 200 && response.status < 300) {
        return response;
      } else {
        return response.json().then((json) => {
          if (response.status === 409 && json.code === 'already_owned') {
            return { status: 201 };
          } else {
            throw getError(response, { status: 'error', payload: json });
          }
        });
      }
    });
}

function getPackageUploadMacaroon(root, discharge, snapName) {
  return fetch(`${conf.get('STORE_API_URL')}/acl/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Macaroon root="${root}", discharge="${discharge}"`
    },
    body: JSON.stringify({
      packages: [{ name: snapName, series: STORE_SERIES }],
      permissions: ['package_upload'],
      channels: STORE_CHANNELS
    })
  })
    .then((response) => response.json().then((json) => {
      if (response.status !== 200 || !json.macaroon) {
        throw new APICompatibleError({
          code: 'snap-name-not-registered',
          message: 'Snap name is not registered in the store',
          snap_name: snapName
        });
      }
      return json.macaroon;
    }));
}

export function registerName(repository, snapName, options={}) {
  return (dispatch) => {
    const { fullName } = repository;

    dispatch({
      type: REGISTER_NAME,
      payload: { id: fullName, snapName }
    });

    let root;
    let discharge;
    let packageUploadMacaroon;
    return getPackageUploadRequestMacaroon()
      .then((macaroons) => {
        ({ root, discharge } = macaroons);
        if (options.signAgreement) {
          return signAgreement(root, discharge)
            .then(() => {
              return dispatch(getAccountInfo(options.signAgreement, {
                root, discharge
              }));
            });
        }
      })
      .then(() => internalRegisterName(root, discharge, snapName, repository.url))
      .then(() => getPackageUploadMacaroon(root, discharge, snapName))
      .then((macaroon) => {
        packageUploadMacaroon = macaroon;
        return fetch(`${BASE_URL}/api/launchpad/snaps/authorize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            repository_url: repository.url,
            snap_name: snapName,
            series: STORE_SERIES,
            channels: STORE_CHANNELS,
            macaroon: packageUploadMacaroon
          }),
          credentials: 'same-origin'
        });
      })
      .then(checkStatus)
      .then(() => dispatch(registerNameSuccess(fullName, snapName)))
      .then(() => {
        if (options.requestBuilds) {
          return dispatch(requestBuilds(repository.url));
        }
      })
      .catch((error) => dispatch(registerNameError(fullName, error)));
  };
}

export function registerNameSuccess(id, snapName) {
  return {
    type: REGISTER_NAME_SUCCESS,
    payload: { id, snapName }
  };
}

export function registerNameError(id, error) {
  return {
    type: REGISTER_NAME_ERROR,
    payload: {
      id,
      error
    },
    error: true
  };
}
