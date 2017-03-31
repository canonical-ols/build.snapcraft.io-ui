import 'isomorphic-fetch';
import url from 'url';

export const MAILCHIMP_FORM_URL = 'https://canonical.us3.list-manage.com/subscribe/post-json';
export const MAILCHIMP_FORM_U = '56dac47c206ba0f58ec25f314';
export const MAILCHIMP_FORM_ID = '381f5c55f1';

export const privateRepos = async (req, res) => {
  const formUrl = url.parse(MAILCHIMP_FORM_URL);
  const submitUrl = url.format({
    ...formUrl,
    query: {
      u: MAILCHIMP_FORM_U,
      id: MAILCHIMP_FORM_ID,
      EMAIL: req.query.email
    }
  });

  const response = await fetch(submitUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });
  const json = await response.json();
  return res.status(response.status).send(json);
};
