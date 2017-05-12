import React, { PropTypes } from 'react';

import { conf } from '../../helpers/config';
const BASE_URL = conf.get('BASE_URL');

const getBadgeUrl = (fullName) => `${BASE_URL}/badge/${fullName}.svg`;

// TODO: (when we have UI to copy Markdown)
// const getRepoPageUrl = (fullName) => `${BASE_URL}/user/${fullName}`;
// const getBadgeMarkdown = (fullName) => `[![Snap Status](${getBadgeUrl(fullName)})](${getRepoPageUrl(fullName)})`;

export default function Badge({ fullName }) {
  return (
    <div>
      <img src={getBadgeUrl(fullName)} alt={`Snap build status for ${fullName}`} />
    </div>
  );
}

Badge.propTypes = {
  fullName: PropTypes.string.isRequired
};
