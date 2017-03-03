import React, { PropTypes } from 'react';
import url from 'url';

import { parseGitHubRepoUrl } from '../../../helpers/github-url';

import { Row, Data, Dropdown } from '../../vanilla/table-interactive';

import templateYaml from './template-yaml.js';

// TODO: move dropdown styles? (.helpText)
import styles from '../repositoryRow.css';

const LEARN_THE_BASICS_LINK = 'https://snapcraft.io/docs/build-snaps/your-first-snap';
const INSTALL_IT_LINK = 'https://snapcraft.io/create/';

const getTemplateUrl = (snap) => {
  const { fullName } = parseGitHubRepoUrl(snap.git_repository_url);
  const templateUrl = url.format({
    protocol: 'https:',
    host: 'github.com',
    pathname: `${fullName}/new/master`,
    query: {
      'filename': 'snap/snapcraft.yaml',
      'value': templateYaml
    }
  });

  return templateUrl;
};

const UnconfiguredDropdown = (props) => {
  const { snap } = props;

  return (
    <Dropdown>
      <Row>
        <Data col="100">
          <p>
            This repo needs a snapcraft.yaml file,
            so that Snapcraft can make it buildable,
            installable, and runnable.
          </p>
          <p className={ styles.helpText }>
            <a href={ LEARN_THE_BASICS_LINK } target="_blank">Learn the basics</a>,
            or
            <a href={ getTemplateUrl(snap) } target="_blank"> get started with a template</a>.
          </p>
          <p className={ styles.helpText }>
            Don’t have snapcraft?
            <a href={ INSTALL_IT_LINK } target="_blank"> Install it on your own PC </a>
            for testing.
          </p>
        </Data>
      </Row>
    </Dropdown>
  );
};

UnconfiguredDropdown.propTypes = {
  snap: PropTypes.shape({
    git_repository_url: PropTypes.string
  })
};

export default UnconfiguredDropdown;
