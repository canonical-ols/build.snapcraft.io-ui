import React, { Component, PropTypes } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';

import { createWebhook } from '../actions/webhook';
import Spinner from '../components/spinner';

import styles from './container.css';

class RepositorySetup extends Component {
  componentDidMount() {
    this.props.dispatch(createWebhook(this.props.account, this.props.repo));
  }

  render() {
    const { fullName } = this.props;

    return (
      <div className={styles.container}>
        <Helmet
          title={`Setting up ${fullName}`}
        />
        <h1>Setting up {fullName}</h1>
        <div className={styles.spinner}><Spinner /></div>
      </div>
    );
  }
}

RepositorySetup.propTypes = {
  account: PropTypes.string.isRequired,
  repo: PropTypes.string.isRequired,
  fullName: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired
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

export default connect(mapStateToProps)(RepositorySetup);
