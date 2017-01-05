import React, { Component, PropTypes } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { createWebhook } from '../actions/webhook';
import { Message } from '../components/forms';
import Spinner from '../components/spinner';

import styles from './container.css';

class RepositorySetup extends Component {
  componentDidMount() {
    const { account, repo, isPending } = this.props;

    if (!isPending) {
      this.props.dispatch(createWebhook(account, repo));
    }
  }

  render() {
    const { fullName, isPending, success, error } = this.props;

    if (success) {
      this.props.router.push(`/${fullName}/builds`);
    } else {
      return (
        <div className={styles.container}>
          <Helmet
            title={`Setting up ${fullName}`}
          />
          <h1>Setting up {fullName}</h1>
          { isPending &&
            <div className={styles.spinner}><Spinner /></div>
          }
          { error &&
            <Message status='error'>{ this.props.error.message }</Message>
          }
        </div>
      );
    }
  }
}

RepositorySetup.propTypes = {
  account: PropTypes.string.isRequired,
  repo: PropTypes.string.isRequired,
  fullName: PropTypes.string.isRequired,
  isPending: PropTypes.bool,
  success: PropTypes.bool,
  error: PropTypes.object,
  router: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
};

const mapStateToProps = (state, ownProps) => {
  const account = ownProps.params.account.toLowerCase();
  const repo = ownProps.params.repo.toLowerCase();
  const fullName = `${account}/${repo}`;

  const isPending = state.webhook.isPending;
  const success = state.webhook.success;
  const error = state.webhook.error;

  return {
    account,
    repo,
    fullName,
    isPending,
    success,
    error
  };
};

export default connect(mapStateToProps)(withRouter(RepositorySetup));
