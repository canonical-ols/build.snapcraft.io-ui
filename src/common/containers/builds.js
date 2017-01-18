import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';

import BuildHistory from '../components/build-history';
import { Message } from '../components/forms';
import Spinner from '../components/spinner';

import { getGitHubRepoUrl } from '../helpers/github-url';
import { fetchBuilds, fetchSnap } from '../actions/snap-builds';

import styles from './container.css';

class Builds extends Component {
  fetchInterval = null

  fetchData({ snapLink, repository }) {
    if (snapLink) {
      this.props.dispatch(fetchBuilds(snapLink));
    } else {
      this.props.dispatch(fetchSnap(repository.url));
    }
  }

  componentWillMount() {
    this.fetchData(this.props);

    this.fetchInterval = setInterval(() => {
      this.fetchData(this.props);
    }, 15000);
  }

  componentWillUnmount() {
    clearInterval(this.fetchInterval);
  }

  componentWillReceiveProps(nextProps) {
    // if snap link or repo name changed, fetch new data
    if ((this.props.snapLink !== nextProps.snapLink) ||
        (this.props.repository.fullName !== nextProps.repository.fullName)) {
      this.fetchData(nextProps);
    }
  }

  render() {
    const { fullName } = this.props.repository;
    // only show spinner when data is loading for the first time
    const isLoading = this.props.isFetching && !this.props.success;

    return (
      <div className={ styles.container }>
        <Helmet
          title={`${fullName} builds`}
        />
        <h1>{fullName} builds</h1>
        <BuildHistory repository={this.props.repository} />
        { isLoading &&
          <div className={styles.spinner}><Spinner /></div>
        }
        { this.props.error &&
          <Message status='error'>{ this.props.error.message || this.props.error }</Message>
        }
      </div>
    );
  }

}

Builds.propTypes = {
  repository: PropTypes.shape({
    owner: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    fullName: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired
  }),
  isFetching: PropTypes.bool,
  snapLink: PropTypes.string,
  success: PropTypes.bool,
  error: PropTypes.object,
  dispatch: PropTypes.func.isRequired
};

const mapStateToProps = (state, ownProps) => {
  const owner = ownProps.params.owner.toLowerCase();
  const name = ownProps.params.name.toLowerCase();
  const fullName = `${owner}/${name}`;
  const url = getGitHubRepoUrl(fullName);

  const isFetching = state.snapBuilds.isFetching;
  const snapLink = state.snapBuilds.snapLink;
  const success = state.snapBuilds.success;
  const error = state.snapBuilds.error;

  return {
    isFetching,
    snapLink,
    success,
    error,
    repository: {
      owner,
      name,
      fullName,
      url
    }
  };
};

export default connect(mapStateToProps)(Builds);
