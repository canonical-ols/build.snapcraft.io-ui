import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';

import BuildRow from '../components/build-row';
import BuildLog from '../components/build-log';
import { Message } from '../components/forms';
import { fetchBuilds, fetchSnap } from '../actions/snap-builds';

import styles from './container.css';

class BuildDetails extends Component {

  fetchData({ snapLink, repository }) {
    if (snapLink) {
      this.props.dispatch(fetchBuilds(snapLink));
    } else {
      this.props.dispatch(fetchSnap(repository.fullName));
    }
  }

  componentWillMount() {
    this.fetchData(this.props);
  }

  componentWillReceiveProps(nextProps) {
    // if snap link or repo name changed, fetch new data
    if ((this.props.snapLink !== nextProps.snapLink) ||
        (this.props.repository.fullName !== nextProps.repository.fullName)) {
      this.fetchData(nextProps);
    }
  }

  render() {
    const { repository, buildId, build } = this.props;
    const { fullName } = repository;

    return (
      <div className={ styles.container }>
        <Helmet
          title={`${fullName} builds`}
        />
        <h1>{fullName} build #{buildId}</h1>
        { this.props.isFetching &&
          <span>Loading...</span>
        }
        { this.props.error &&
          <Message status='error'>{ this.props.error.message || this.props.error }</Message>
        }
        { build &&
          <div>
            <BuildRow repository={repository} {...build} />
            <h3>Build log:</h3>
            <BuildLog logUrl={build.buildLogUrl} />
          </div>
        }
      </div>
    );
  }

}
BuildDetails.propTypes = {
  repository: PropTypes.shape({
    owner: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    fullName: PropTypes.string.isRequired,
  }),
  buildId: PropTypes.string.isRequired,
  build: PropTypes.object,
  isFetching: PropTypes.bool,
  snapLink: PropTypes.string,
  error: PropTypes.object,
  dispatch: PropTypes.func.isRequired
};

const mapStateToProps = (state, ownProps) => {
  const owner = ownProps.params.owner.toLowerCase();
  const name = ownProps.params.name.toLowerCase();
  const fullName = `${owner}/${name}`;

  const buildId = ownProps.params.buildId.toLowerCase();

  const build = state.snapBuilds.builds.filter((build) => build.buildId === buildId)[0];
  const isFetching = state.snapBuilds.isFetching;
  const error = state.snapBuilds.error;
  const snapLink = state.snapBuilds.snapLink;

  return {
    repository: {
      owner,
      name,
      fullName
    },
    buildId,
    build,
    isFetching,
    snapLink,
    error
  };
};

export default connect(mapStateToProps)(BuildDetails);
