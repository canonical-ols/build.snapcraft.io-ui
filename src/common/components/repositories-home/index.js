import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { hasSnaps } from '../../selectors';
import { fetchUserSnaps } from '../../actions/snaps';
import { fetchBuilds } from '../../actions/snap-builds';
import { LinkButton } from '../vanilla/button';
import { HeadingThree } from '../vanilla/heading';
import FirstTimeHeading from '../first-time-heading';
import RepositoriesList from '../repositories-list';
import styles from './repositories-home.css';
import Spinner from '../spinner';

// loading container styles not to duplicate .spinner class
import { spinner as spinnerStyles } from '../../containers/container.css';

let interval;
const SNAP_POLL_PERIOD = (15 * 1000);

class RepositoriesHome extends Component {

  updateBuilds(props) {
    const { snaps, entities } = props;
    snaps.ids.forEach((id) => {
      const snap = entities.snaps[id];
      this.props.fetchBuilds(snap.gitRepoUrl, snap.selfLink);
    });
  }

  componentDidMount() {
    const { authenticated } = this.props.auth;
    const { updateSnaps } = this.props;
    const owner = this.props.user.login;

    if (authenticated) {
      updateSnaps(owner);
      if (!interval) {
        interval = setInterval(() => {
          updateSnaps(owner);
        }, SNAP_POLL_PERIOD);
      }
    }
  }

  componentWillUnmount() {
    clearInterval(interval);
    interval = null;
  }

  componentWillReceiveProps(nextProps) {
    const { hasSnaps, snaps } = nextProps;
    // if snaps stopped fetching
    if ((this.props.snaps.isFetching !== snaps.isFetching) && !snaps.isFetching) {
      // if user doesn't have enabled repos open add repositories view
      if (!hasSnaps && nextProps.hasJustSignedIn) {
        this.props.router.replace('/select-repositories');
      } else {
        // or remove sign-in from URL
        if (nextProps.hasJustSignedIn) {
          this.props.router.replace(`/user/${nextProps.user.login}`);
        }
        // and update builds for their snaps
        this.updateBuilds(nextProps);
      }
    }
  }

  renderRepositoriesList() {
    // TODO: bartaz refactor
    // should it fetch data for first time heading (it already does need it anyway probably)
    // move it to HOC?

    return (
      <div>
        <FirstTimeHeading isOnMyRepos={true} />
        <div className={ styles['button-container'] }>
          <HeadingThree>Repos to build and publish</HeadingThree>
          <div>
            <LinkButton appearance="positive" to="/select-repositories">
              Add repos…
            </LinkButton>
          </div>
        </div>
        <RepositoriesList />
      </div>
    );
  }

  renderSpinner() {
    return (
      <div className={ spinnerStyles }>
        <Spinner />
      </div>
    );
  }

  render() {
    // show spinner if user has just signed in snaps data was not yet fetched
    //
    // when snaps are loaded and user (how just signed in) doesn't have any,
    // they will be redirected to select repositories
    return (this.props.hasJustSignedIn && this.props.snaps.isFetching)
      ? this.renderSpinner()
      : this.renderRepositoriesList();
  }
}

RepositoriesHome.propTypes = {
  hasJustSignedIn: PropTypes.bool,
  auth: PropTypes.object.isRequired,
  user: PropTypes.object,
  entities: PropTypes.object,
  snaps: PropTypes.object.isRequired,
  snapBuilds: PropTypes.object.isRequired,
  hasSnaps: PropTypes.bool,
  router: PropTypes.object.isRequired,
  updateSnaps: PropTypes.func.isRequired,
  fetchBuilds: PropTypes.func.isRequired
};

function mapStateToProps(state, ownProps) {
  const {
    auth,
    user,
    entities,
    snaps,
    snapBuilds
  } = state;

  return {
    hasJustSignedIn: ownProps.hasJustSignedIn,
    auth,
    user,
    entities,
    snaps,
    snapBuilds,
    hasSnaps: hasSnaps(state)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    updateSnaps: (owner) => {
      dispatch(fetchUserSnaps(owner));
    },
    fetchBuilds: (repositoryUrl, snapLink) => {
      dispatch(fetchBuilds(repositoryUrl, snapLink));
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(RepositoriesHome));
export const RepositoriesHomeRaw = RepositoriesHome;
