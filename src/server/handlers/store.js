import 'isomorphic-fetch';
import url from 'url';

import { conf } from '../helpers/config';

const STORE_CPI_API_URL = conf.get('STORE_CPI_API_URL');

export const getSnapDetails = async (req, res) => {
  const snapName = req.params.name;
  const query = {};

  // pass allowed query parameters
  for (const key of ['fields', 'channel', 'confinement'] ) {
    if (req.query && req.query.hasOwnProperty(key)) {
      query[key] = req.query[key];
    }
  }

  const fetchUrl = url.format({
    ...url.parse(`${STORE_CPI_API_URL}/snaps/details/${snapName}`),
    query
  });

  try {
    const response = await fetch(fetchUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Ubuntu-Series': '16'
      }
    });
    const json = await response.json();

    res.status(response.status).send(json);
  } catch (error) {
    return res.status(500).send({
      status: 'error',
      code: 'store-cpi-api-failure',
      message: error.message
    });
  }
};
