import 'isomorphic-fetch';
import { MacaroonsBuilder } from 'macaroons.js';

import { getCaveats } from '../../common/helpers/macaroons';
import { conf } from '../helpers/config';
import logging from '../logging';

const logger = logging.getLogger('express');

const dumpCaveats = (rawMacaroon) => {
  const macaroon = MacaroonsBuilder.deserialize(rawMacaroon);
  const caveats = [];
  for (const caveat of getCaveats(macaroon)) {
    if (caveat.verificationKeyId === '') {
      caveats.push(caveat.caveatId);
    } else {
      caveats.push(`Discharge required from ${caveat.location}`);
    }
  }
  return caveats;
};

export const registerName = async (req, res) => {
  const snapName = req.body.snap_name;
  const root = req.body.root;
  const discharge = req.body.discharge;

  const url = `${conf.get('STORE_API_URL')}/register-name/`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Macaroon root="${root}", discharge="${discharge}"`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ snap_name: snapName })
  });
  const json = await response.json();
  if (response.status === 401) {
    // Debug https://github.com/canonical-ols/build.snapcraft.io/issues/527
    logger.info(`Failed to register name "${snapName}"`);
    logger.info(`Root macaroon: ${dumpCaveats(root)}`);
    logger.info(`Discharge macaroon: ${dumpCaveats(discharge)}`);
    logger.info(
      `WWW-Authenticate: ${response.headers.get('WWW-Authenticate')}`);
  }
  return res.status(response.status).send(json);
};

export const getAccount = async (req, res) => {
  const root = req.query.root;
  const discharge = req.query.discharge;

  const response = await fetch(`${conf.get('STORE_API_URL')}/account`, {
    headers: {
      'Authorization': `Macaroon root="${root}", discharge="${discharge}"`,
      'Accept': 'application/json'
    }
  });
  const json = await response.json();
  return res.status(response.status).send(json);
};

export const patchAccount = async (req, res) => {
  const shortNamespace = req.body.short_namespace;
  const root = req.body.root;
  const discharge = req.body.discharge;

  const response = await fetch(`${conf.get('STORE_API_URL')}/account`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Macaroon root="${root}", discharge="${discharge}"`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ short_namespace: shortNamespace })
  });
  const text = await response.text();
  let json;
  if (text === '') {
    json = null;
  } else {
    json = JSON.parse(text);
  }
  return res.status(response.status).send(json);
};

export const signAgreement = async (req, res) => {
  const latestTosAccepted = req.body.latest_tos_accepted;
  const root = req.body.root;
  const discharge = req.body.discharge;

  const response = await fetch(`${conf.get('STORE_API_URL')}/agreement/`, {
    method: 'POST',
    headers: {
      'Authorization': `Macaroon root="${root}", discharge="${discharge}"`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ latest_tos_accepted: latestTosAccepted })
  });
  const json = await response.json();
  return res.status(response.status).send(json);
};

export const nameOwnership = async (req, res) => {
  const snapName = req.query.snap_name;
  const root = req.query.root;
  const discharge = req.query.discharge;

  if (!snapName) {
    return res.status(400).send({
      status: 'error',
      code: 'snap-name-not-specified',
      message: 'snap_name is required'
    });
  }

  try {
    // first request package_upload macaroon to see if name is registered
    // in the store
    const url = `${conf.get('STORE_API_URL')}/acl/`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        packages: [{ name: snapName }],
        permissions: ['package_upload']
      })
    });
    const json = await response.json();

    if (response.status === 200 && json.macaroon) {
      // name is registered, so try to register it (again) to find who owns it
      const url = `${conf.get('STORE_API_URL')}/register-name/`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Macaroon root="${root}", discharge="${discharge}"`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ snap_name: snapName })
      });
      const json = await response.json();

      // expected result is 409 Conflict, because name is already registered
      if (response.status === 409) {

        // if code is "already_owned" - current user already owns the name
        // otherwise (code is "already_registered" or else) name is owned by someone else
        const owned = json.code === 'already_owned';

        return res.status(200).send({
          status: 'success',
          code: owned
            ? 'name-ownership-already-owned'
            : 'name-ownership-registered-by-other-user',
          message: owned
            ? `You already own snap name '${snapName}'.`
            : `Snap name '${snapName}' is owned by someone else.`
        });
      } else {
        logger.info(`Unexpected name registration result when checking ownership of '${snapName}'.`);

        return res.status(500).send({
          status: 'error',
          code: 'name-ownership-failure',
          message: 'Unexpected name registration result.',
          response: json
        });
      }
    } else {
      return res.status(200).send({
        status: 'success',
        code: 'name-ownership-not-registered',
        message: `Snap name '${snapName}' is not registered in the store`
      });
    }
  }
  catch(e) {
    return res.status(500).send({
      status: 'error',
      code: 'name-ownership-failure',
      message: e.message
    });
  }
};
