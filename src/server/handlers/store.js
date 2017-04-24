import 'isomorphic-fetch';
import { conf } from '../helpers/config';

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

// XXX: Client can go straight to SCA for this now
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
