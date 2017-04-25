import 'isomorphic-fetch';
import { conf } from '../helpers/config';

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
