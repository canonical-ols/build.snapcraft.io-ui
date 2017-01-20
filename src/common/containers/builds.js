import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';

import BuildHistory from '../components/build-history';
import { Message } from '../components/forms';
import Spinner from '../components/spinner';

import { setGitHubRepository } from '../actions/repository-input';
import { fetchBuilds, fetchSnap } from '../actions/snap-builds';

import styles from './container.css';

class Builds extends Component {
  fetchInterval = null

  fetchData({ snapLink, repository }) {
    if (snapLink) {
      this.props.dispatch(fetchBuilds(snapLink));
    } else if (repository) {
      this.props.dispatch(fetchSnap(repository.url));
    }
  }

  componentDidMount() {
    if (!this.props.repository && this.props.fullName) {
      this.props.dispatch(setGitHubRepository(this.props.fullName));
    }

    this.fetchData(this.props);

    this.fetchInterval = setInterval(() => {
      this.fetchData(this.props);
    }, 15000);
  }

  componentWillUnmount() {
    clearInterval(this.fetchInterval);
  }

  componentWillReceiveProps(nextProps) {
    const currentSnapLink = this.props.snapLink;
    const nextSnapLink = nextProps.snapLink;
    const currentRepository = this.props.repository && this.props.repository.fullName;
    const nextRepository = nextProps.repository && nextProps.repository.fullName;

    if (this.props.fullName !== nextProps.fullName) {
      this.props.dispatch(setGitHubRepository(nextProps.fullName));
    } else if ((currentSnapLink !== nextSnapLink) || (currentRepository !== nextRepository)) {
      // if snap link or repo changed, fetch new data
      this.fetchData(nextProps);
    }
  }

  render() {
    const { fullName, repository } = this.props;
    // only show spinner when data is loading for the first time
    const isLoading = !repository || (this.props.isFetching && !this.props.success);

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
  fullName: PropTypes.string.isRequired,
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
  const repository = state.repository;

  return {
    fullName,
    repository,
    ...state.snapBuilds
  };
};

export default connect(mapStateToProps)(Builds);
