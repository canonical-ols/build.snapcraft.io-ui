import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';

import BuildRow from '../components/build-row';
import BuildLog from '../components/build-log';
import styles from './container.css';

const BuildDetails = (props) => {
  const { account, repo, fullName, buildId, build } = props;

  return (
    <div className={ styles.container }>
      <Helmet
        title={`${fullName} builds`}
      />
      {/* TODO: make into title component? */}
      <h1>{fullName} build #{buildId}</h1>

      <BuildRow account={account} repo={repo} {...build} />

      <h3>Build log:</h3>
      <BuildLog logUrl='http://pastebin.com/raw/NuPJQt4S' />
    </div>
  );
};

BuildDetails.propTypes = {
  account: PropTypes.string.isRequired,
  repo: PropTypes.string.isRequired,
  fullName: PropTypes.string.isRequired,
  buildId: PropTypes.string.isRequired,
  build: PropTypes.object
};

const mapStateToProps = (state, ownProps) => {
  const account = ownProps.params.account.toLowerCase();
  const repo = ownProps.params.repo.toLowerCase();
  const buildId = ownProps.params.buildId.toLowerCase();

  const fullName = `${account}/${repo}`;
  // TODO:
  // find build by id in builds list
  // but it should also fetch it if necessary
  const build = state.snapBuilds.builds.filter((build) => build.buildId === buildId)[0];

  return {
    account,
    repo,
    fullName,
    buildId,
    build
  };
};

export default connect(mapStateToProps)(BuildDetails);
