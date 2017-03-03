import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import localforage from 'localforage';

import { Row, Data } from '../vanilla/table-interactive';
import BuildStatus from '../build-status';

import {
  NameMismatchDropdown,
  RemoveRepoDropdown,
  UnconfiguredDropdown,
  UnregisteredDropdown
} from './dropdowns';

import { signIntoStore } from '../../actions/auth-store';
import { registerName, registerNameError } from '../../actions/register-name';
import { removeSnap } from '../../actions/snaps';

import { parseGitHubRepoUrl } from '../../helpers/github-url';

import styles from './repositoryRow.css';

const tickIcon = <span className={styles.tickIcon} />;
const errorIcon = <span className={styles.errorIcon} />;

class RepositoryRow extends Component {

  constructor(props) {
    super(props);

    let snapName;
    if (props.snap.snapcraft_data && props.snap.snapcraft_data.name) {
      snapName = props.snap.snapcraft_data.name;
    } else {
      snapName = '';
    }

    this.state = {
      snapName,
      nameMismatchDropdownExpanded: false,
      unconfiguredDropdownExpanded: false,
      unregisteredDropdownExpanded: false,
      removeDropdownExpanded: false,
      signAgreement: false
    };
  }

  saveState() {
    localforage.setItem(`repository_row_${this.props.snap.git_repository_url}`, this.state);
  }

  loadState() {
    localforage.getItem(`repository_row_${this.props.snap.git_repository_url}`)
      .then((state) => {
        if (state) {
          this.setState(state);
        }
      });
  }

  clearState() {
    localforage.removeItem(`repository_row_${this.props.snap.git_repository_url}`);
  }

  componentDidMount() {
    this.loadState();
  }

  componentDidUpdate() {
    // save the component state in browser storage whenever it changes
    this.saveState();
  }

  // TODO: bartaz - add nameMismatchDropdownExpanded being closed when other opens

  onConfiguredClick() {
    this.setState({
      unconfiguredDropdownExpanded: !this.state.unconfiguredDropdownExpanded,
      unregisteredDropdownExpanded: false,
      removeDropdownExpanded: false
    });
  }

  onNameMismatchClick() {
    this.setState({
      nameMismatchDropdownExpanded: !this.state.nameMismatchDropdownExpanded,
      unconfiguredDropdownExpanded: false,
      unregisteredDropdownExpanded: false,
      removeDropdownExpanded: false
    });
  }

  onUnregisteredClick() {
    this.setState({
      unconfiguredDropdownExpanded: false,
      unregisteredDropdownExpanded: !this.state.unregisteredDropdownExpanded,
      removeDropdownExpanded: false
    });
  }

  onToggleRemoveClick() {
    this.setState({
      unconfiguredDropdownExpanded: false,
      unregisteredDropdownExpanded: false,
      removeDropdownExpanded: !this.state.removeDropdownExpanded
    });
  }

  closeUnregisteredDropdown() {
    this.setState({ unregisteredDropdownExpanded: false });
    delete this.closeUnregisteredTimerID;
  }

  onSignInClick() {
    this.props.dispatch(signIntoStore());
  }

  onSignAgreementChange(event) {
    this.setState({ signAgreement: event.target.checked });
  }

  onSnapNameChange(event) {
    const { dispatch, fullName } = this.props;
    const snapName = event.target.value.replace(/[^a-z0-9-]/g, '');
    let clientValidationError = null;
    this.setState({ snapName });

    if (/^-|-$/.test(snapName)) {
      clientValidationError = {
        message: 'Sorry the name can\'t start or end with a hyphen.'
      };
    }

    dispatch(registerNameError(fullName, clientValidationError));
  }

  onRegisterClick(repositoryUrl) {
    const { authStore, snap, dispatch } = this.props;
    const repository = parseGitHubRepoUrl(repositoryUrl);
    const { snapName, signAgreement } = this.state;
    const requestBuilds = (!!snap.snapcraft_data);

    dispatch(registerName(repository, snapName, {
      signAgreement: signAgreement ? authStore.userName : null,
      requestBuilds
    }));
  }

  onRemoveClick(repositoryUrl) {
    this.props.dispatch(removeSnap(repositoryUrl));
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.registerNameStatus.success &&
        !this.props.registerNameStatus.success) {
      this.closeUnregisteredTimerID = window.setTimeout(
        this.closeUnregisteredDropdown.bind(this), 2000
      );
    }
  }

  componentWillUnmount() {
    // when user goes to different view within the app we can clear the state from storage
    // so we don't keep it unnecessarily long in browser store

    // XXX
    // This call of `clearState` makes it safe to keep potentially not yet resolved promise
    // from `loadStore`, because after clearing it will resolve with empty state and not
    // attempt to update the component.
    // But if we ever decide we don't want to clear stored state there we need to make sure
    // to cancel promise from loadStore because it may try to set the state after component
    // is already unmounted which will cause React error.
    // See: https://facebook.github.io/react/blog/2015/12/16/ismounted-antipattern.html
    this.clearState();

    if (this.closeUnregisteredTimerID) {
      window.clearTimeout(this.closeUnregisteredTimerID);
      delete this.closeUnregisteredTimerID;
    }
  }

  render() {
    const {
      snap,
      latestBuild,
      fullName,
      authStore,
      registerNameStatus
    } = this.props;

    const unconfigured = true;
    const showUnconfiguredDropdown = unconfigured && this.state.unconfiguredDropdownExpanded;
    const showUnregisteredDropdown = this.state.unregisteredDropdownExpanded;
    const showRemoveDropdown = this.state.removeDropdownExpanded;
    const showNameMismatchDropdown = this.state.nameMismatchDropdownExpanded;
    const showRegisterNameInput = (
      showUnregisteredDropdown && authStore.authenticated
    );
    const registeredName = (
      registerNameStatus.success ?
      registerNameStatus.snapName : snap.store_name
    );

    const hasBuilt = latestBuild && snap.snapcraft_data;
    const isActive = (
      showNameMismatchDropdown ||
      showUnconfiguredDropdown ||
      showUnregisteredDropdown ||
      showRemoveDropdown
    );
    // XXX cjwatson 2017-02-28: The specification calls for the remove icon
    // to be shown only when hovering over or tapping in an empty part of
    // the row.  My attempts to do this so far have resulted in the remove
    // icon playing hide-and-seek.

    return (
      <Row isActive={isActive}>
        <Data col="27">
          { hasBuilt
            ? (
              <Link to={ `/${fullName}/builds` }>{ fullName }</Link>
            )
            : (
              <span>{ fullName }</span>
            )
          }
        </Data>
        <Data col="15">
          { this.renderConfiguredStatus.call(this, snap) }
        </Data>
        <Data col="25">
          { this.renderSnapName.call(this, registeredName, showRegisterNameInput) }
        </Data>
        <Data col="30">
          {/*
            TODO: show 'Loading' when waiting for status?
              and also show 'Never built' when no builds available
          */}
          { hasBuilt
            ? (
              <BuildStatus
                link={ `/${fullName}/builds/${latestBuild.buildId}`}
                colour={ latestBuild.colour }
                statusMessage={ latestBuild.statusMessage }
                dateStarted={ latestBuild.dateStarted }
              />
            )
            : (
              <BuildStatus
                colour="grey"
                statusMessage="Never built"
              />
            )
          }
        </Data>
        <Data col="3">
          <a
            className={ `${styles.icon} ${styles.deleteIcon}` }
            onClick={ this.onToggleRemoveClick.bind(this) }
          />
        </Data>
        { showNameMismatchDropdown && <NameMismatchDropdown snap={snap} /> }
        { showUnconfiguredDropdown && <UnconfiguredDropdown snap={snap} /> }
        { showUnregisteredDropdown &&
          <UnregisteredDropdown
            snapName={this.state.snapName}
            authStore={authStore}
            registerNameStatus={registerNameStatus}
            onSignAgreementChange={this.onSignAgreementChange.bind(this)}
            onRegisterClick={this.onRegisterClick.bind(this, snap.git_repository_url)}
            onSignInClick={this.onSignInClick.bind(this)}
            onCancelClick={this.onUnregisteredClick.bind(this)}
          />
        }
        { showRemoveDropdown &&
          <RemoveRepoDropdown
            latestBuild={latestBuild}
            registeredName={registeredName}
            onRemoveClick={this.onRemoveClick.bind(this, snap.git_repository_url)}
            onCancelClick={this.onToggleRemoveClick.bind(this)}
          />
        }
      </Row>
    );
  }

  renderConfiguredStatus(snap) {
    const { snapcraft_data, store_name } = snap;

    if (!snapcraft_data) {
      return (
        <a onClick={this.onConfiguredClick.bind(this)}>Not configured</a>
      );
    } else if (snapcraft_data && store_name && snapcraft_data.name !== store_name){
      return (
        <span>
          { errorIcon }
          {' ' /* space between inline elements */}
          <a onClick={this.onNameMismatchClick.bind(this)}>
            Doesn’t match
          </a>
        </span>
      );
    }

    return tickIcon;
  }

  renderSnapName(registeredName, showRegisterNameInput) {
    if (registeredName !== null) {
      return (
        <span>
          { tickIcon } { registeredName }
        </span>
      );
    } else if (showRegisterNameInput) {
      return (
        <input
          type='text'
          className={ styles.snapName }
          value={ this.state.snapName }
          onChange={ this.onSnapNameChange.bind(this) }
        />
      );
    } else {
      return (
        <a onClick={this.onUnregisteredClick.bind(this)}>
          Not registered
        </a>
      );
    }
  }


}

RepositoryRow.propTypes = {
  snap: PropTypes.shape({
    resource_type_link: PropTypes.string,
    git_repository_url: PropTypes.string,
    self_link: PropTypes.string,
    store_name: PropTypes.string,
    snapcraft_data: PropTypes.object
  }),
  latestBuild: PropTypes.shape({
    buildId: PropTypes.string,
    status: PropTypes.string,
    statusMessage: PropTypes.string
  }),
  fullName: PropTypes.string,
  authStore: PropTypes.shape({
    authenticated: PropTypes.bool,
    hasDischarge: PropTypes.bool,
    isFetching: PropTypes.bool,
    signedAgreement: PropTypes.bool,
    userName: PropTypes.string
  }),
  registerNameStatus: PropTypes.shape({
    isFetching: PropTypes.bool,
    success: PropTypes.bool,
    error: PropTypes.object
  }),
  dispatch: PropTypes.func.isRequired
};

export default connect()(RepositoryRow);
