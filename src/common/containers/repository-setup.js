import React, { Component, PropTypes } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { getGitHubRepoUrl } from '../helpers/github-url';
import { createWebhook } from '../actions/webhook';
import { requestBuilds } from '../actions/snap-builds';
import { Message } from '../components/forms';
import Spinner from '../components/spinner';

import styles from './container.css';

class RepositorySetup extends Component {
  componentWillReceiveProps(nextProps) {
    const { repository, webhook, builds } = nextProps;

    if (webhook.success && builds.success) {
      this.props.router.replace(`/${repository.fullName}/builds`);
    }
  }

  componentDidMount() {
    const { repository, webhook, builds } = this.props;

    if (!webhook.isFetching) {
      this.props.dispatch(createWebhook(repository.owner, repository.name));
    }
    if (!builds.isFetching) {
      this.props.dispatch(requestBuilds(repository.url));
    }
  }

  render() {
    const { repository, webhook, builds } = this.props;
    const isFetching = webhook.isFetching || builds.isFetching;

    return (
      <div className={styles.container}>
        <Helmet
          title={`Setting up ${repository.fullName}`}
        />
        { isFetching &&
          <div className={styles.spinner}><Spinner /></div>
        }
        { webhook.error &&
          <Message status='error'>{ webhook.error.message }</Message>
        }
        { builds.error &&
          <Message status='error'>{ builds.error.message }</Message>
        }
      </div>
    );

  }
}

RepositorySetup.propTypes = {
  repository: PropTypes.shape({
    owner: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    fullName: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired
  }),
  webhook: PropTypes.shape({
    isFetching: PropTypes.bool,
    success: PropTypes.bool,
    error: PropTypes.object
  }),
  builds: PropTypes.shape({
    isFetching: PropTypes.bool,
    success: PropTypes.bool,
    error: PropTypes.object
  }),
  router: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
};

const mapStateToProps = (state, ownProps) => {
  const owner = ownProps.params.owner.toLowerCase();
  const name = ownProps.params.name.toLowerCase();
  const fullName = `${owner}/${name}`;
  const url = getGitHubRepoUrl(fullName);

  return {
    repository: {
      owner,
      name,
      fullName,
      url
    },
    webhook: state.webhook,
    builds: state.snapBuilds
  };
};

export default connect(mapStateToProps)(withRouter(RepositorySetup));
