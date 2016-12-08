import React, { PropTypes } from 'react';
import Helmet from 'react-helmet';

import BuildRow from '../components/build-row';

import styles from './container.css';

const BUILD_MOCK = {
  buildId: '1235',
  username: 'John Doe',
  commitId:  'c196edb',
  commitMessage:  'Current commit',
  architecture: 'i386',
  status:  'pending',
  statusMessage: 'Currently building',
  dateStarted: '2016-12-01',
  dateCompleted: null,
  duration: '11 minutes'
};

const Builds = (props) => {
  const { account, repo, buildId } = props.params;
  const name = `${account}/${repo}`;

  return (
    <div className={ styles.container }>
      <Helmet
        title={`${name} builds`}
      />
      {/* TODO: make into title component? */}
      <h1>{name} build #{buildId}</h1>

      <BuildRow account={account} repo={repo} {...BUILD_MOCK} />
    </div>
  );
};

Builds.propTypes = {
  params: PropTypes.shape({
    account: PropTypes.string.isRequired,
    repo: PropTypes.string.isRequired,
  }),
};

export default Builds;
