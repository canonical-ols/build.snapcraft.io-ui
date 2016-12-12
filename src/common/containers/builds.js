import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';

import BuildHistory from '../components/build-history';

import styles from './container.css';

const Builds = (props) => {
  const { account, repo, fullName } = props;

  return (
    <div className={ styles.container }>
      <Helmet
        title={`${fullName} builds`}
      />
      {/* TODO: make into title component? */}
      <h1>{fullName} builds</h1>
      {/* TODO: prepare for loading (waiting for buils list */}
      <BuildHistory account={account} repo={repo}/>
    </div>
  );
};

Builds.propTypes = {
  account: PropTypes.string.isRequired,
  repo: PropTypes.string.isRequired,
  fullName: PropTypes.string.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  const account = ownProps.params.account.toLowerCase();
  const repo = ownProps.params.repo.toLowerCase();
  const fullName = `${account}/${repo}`;

  return {
    account,
    repo,
    fullName
  };
};

export default connect(mapStateToProps)(Builds);
