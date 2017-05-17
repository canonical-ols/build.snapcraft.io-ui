import qs from 'qs';
import React, { PropTypes } from 'react';

import { conf } from '../../../helpers/config';
import { parseGitHubRepoUrl } from '../../../helpers/github-url';

import { Row, Data, Dropdown } from '../../vanilla/table-interactive';

import templateYaml from './template-yaml.js';

import styles from './dropdowns.css';

const BASE_URL = conf.get('BASE_URL');
const LEARN_THE_BASICS_LINK = 'https://snapcraft.io/docs/build-snaps/your-first-snap';
const INSTALL_IT_LINK = 'https://snapcraft.io/create/';

const getTemplateUrl = (snap) => {
  const { owner, name } = parseGitHubRepoUrl(snap.gitRepoUrl);
  return `${BASE_URL}/api/github/repos/${owner}/${name}/new?` + qs.stringify({
    filename: 'snap/snapcraft.yaml',
    value: templateYaml
  });
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
            <a
              href={ LEARN_THE_BASICS_LINK }
              target="_blank"
              rel="noreferrer noopener"
            >
              Learn the basics
            </a>,
            or {' '}
            <a
              href={ getTemplateUrl(snap) }
              target="_blank"
              rel="noreferrer noopener"
            >
              get started with a template
            </a>.
          </p>
          <p className={ styles.helpText }>
            Don’t have snapcraft? {' '}
            <a
              href={ INSTALL_IT_LINK }
              target="_blank"
              rel="noreferrer noopener"
            >
              Install it on your own PC
            </a>
            {' '} for testing.
          </p>
        </Data>
      </Row>
    </Dropdown>
  );
};

UnconfiguredDropdown.propTypes = {
  snap: PropTypes.shape({
    gitRepoUrl: PropTypes.string
  })
};

export default UnconfiguredDropdown;
