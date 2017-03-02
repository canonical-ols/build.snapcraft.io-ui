import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import url from 'url';
import localforage from 'localforage';

import Button from '../vanilla/button';
import { Row, Data, Dropdown } from '../vanilla/table-interactive';
import BuildStatus from '../build-status';
import { Message } from '../forms';
import templateYaml from './template-yaml.js';

import { signIntoStore } from '../../actions/auth-store';
import { registerName, registerNameError } from '../../actions/register-name';
import { removeSnap } from '../../actions/snaps';
import { conf } from '../../helpers/config';
import { parseGitHubRepoUrl } from '../../helpers/github-url';

import styles from './repositoryRow.css';

const FILE_NAME_CLAIM_URL = 'https://myapps.developer.ubuntu.com/dev/click-apps/register-name/';

const LEARN_THE_BASICS_LINK = 'https://snapcraft.io/docs/build-snaps/your-first-snap';
const INSTALL_IT_LINK = 'https://snapcraft.io/create/';
const tickIcon = <span className={ `${styles.icon} ${styles.tickIcon}` } />;
const warningIcon = (
  <span className={ `${styles.icon} ${styles.warningIcon}` } />
);

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

  onConfiguredClick() {
    this.setState({
      unconfiguredDropdownExpanded: !this.state.unconfiguredDropdownExpanded,
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

  renderUnconfiguredDropdown() {
    return (
      <Dropdown>
        <Row>
          <Data col="100">
            <p>
              This repo needs a snapcraft.yaml file,
              so that Snapcraft can make it buildable,
              installable, and runnable.
            </p>
            <p>
              <a href={ LEARN_THE_BASICS_LINK } target="_blank">Learn the basics</a>,
              or
              <a href={ this.getTemplateUrl.call(this) } target="_blank"> get started with a template</a>.
            </p>
            <p>
              Don’t have snapcraft?
              <a href={ INSTALL_IT_LINK } target="_blank"> Install it on your own PC </a>
              for testing.
            </p>
          </Data>
        </Row>
      </Dropdown>
    );
  }

  renderAgreement() {
    const checkbox = (
      <input
        type="checkbox"
        onChange={ this.onSignAgreementChange.bind(this) }
      />
    );
    const link = (
      <a
        className={ styles.external }
        href={ `${conf.get('STORE_DEVPORTAL_URL')}/tos/` }
        target="_blank"
      >
        Developer Programme Agreement
      </a>
    );
    return (
      <div>
        { checkbox } I accept the terms of the { link }
      </div>
    );
  }

  renderUnregisteredDropdown() {
    const { snap, authStore, registerNameStatus } = this.props;

    // If the user has signed into the store but we haven't fetched the
    // resulting discharge macaroon, we need to wait for that before
    // allowing them to proceed.
    const authStoreFetchingDischarge = (
      authStore.hasDischarge && !authStore.authenticated
    );
    const userMustSignAgreement = (
      authStore.authenticated && authStore.signedAgreement === false
    );

    let caption;
    if (registerNameStatus.success) {
      caption = (
        <div>
          { tickIcon } Registered successfully
        </div>
      );
    } else if ( registerNameStatus.error
      && registerNameStatus.error.json
      && registerNameStatus.error.json.payload
      && registerNameStatus.error.json.payload.code === 'already_registered') {
      caption = (
        <Message status='error'>
          <p>Sorry, that name is already taken. Try a different name.</p>
          <p className={ styles.helpText }>
            If you think you should have sole rights to the name,
            you can <a href={ FILE_NAME_CLAIM_URL } target='_blank'>file a claim</a>.
          </p>
        </Message>
      );
    } else if (registerNameStatus.error) {
      caption = (
        <Message status='error'>
          { registerNameStatus.error.message }
        </Message>
      );
    } else {
      caption = (
        <div>
          To publish to the snap store, this repo needs a registered name.
          { !authStore.authenticated &&
            ' You need to sign in to Ubuntu One to register a name.'
          }
          { (authStoreFetchingDischarge || authStore.authenticated) &&
            <div className={ styles.helpText }>
              Lower-case letters, numbers, and hyphens only.
            </div>
          }
          { userMustSignAgreement && this.renderAgreement() }
        </div>
      );
    }

    let actionDisabled;
    let actionOnClick;
    let actionSpinner = false;
    let actionText;
    if (authStore.isFetching) {
      actionDisabled = true;
      actionOnClick = () => {};
      actionSpinner = true;
      actionText = 'Checking...';
    } else if (authStore.authenticated) {
      actionDisabled = (
        this.state.snapName === '' ||
        registerNameStatus.isFetching ||
        !!registerNameStatus.error
      );
      actionOnClick = this.onRegisterClick.bind(this, snap.git_repository_url);
      if (registerNameStatus.isFetching) {
        actionSpinner = true;
        actionText = 'Checking...';
      } else {
        actionText = 'Register Name';
      }
    } else {
      actionDisabled = !!registerNameStatus.error;
      actionOnClick = this.onSignInClick.bind(this);
      actionText = 'Sign in...';
    }

    return (
      <Dropdown>
        <Row>
          <Data col="100">
            { caption }
          </Data>
        </Row>
        <Row>
          <div className={ styles.buttonRow }>
            <a onClick={this.onUnregisteredClick.bind(this)} className={ styles.cancel }>
              Cancel
            </a>
            <Button
              appearance="positive"
              disabled={actionDisabled}
              onClick={actionOnClick}
              isSpinner={actionSpinner}
            >
              { actionText }
            </Button>
          </div>
        </Row>
      </Dropdown>
    );
  }

  renderRemoveDropdown(registeredName) {
    const { snap, latestBuild } = this.props;

    let warningText;
    if (latestBuild) {
      warningText = (
        'Removing this repo will delete all its builds and build logs.'
      );
    } else {
      warningText = (
        'Are you sure you want to remove this repo from the list?'
      );
    }
    if (registeredName !== null) {
      warningText += ' The name will remain registered.';
    }
    // XXX cjwatson 2017-02-28: Once we can get hold of published states for
    // builds, we should also implement this design requirement:
    //   Separately, if any build has been published, the text should end
    //   with:
    //     Published builds will remain published.

    return (
      <Dropdown>
        <Row>
          <Data col="100">
            { warningIcon } { warningText }
          </Data>
        </Row>
        <Row>
          <div className={ styles.buttonRow }>
            <a
              onClick={ this.onToggleRemoveClick.bind(this) }
              className={ styles.cancel }
            >
              Cancel
            </a>
            <Button
              appearance="negative"
              onClick={
                this.onRemoveClick.bind(this, snap.git_repository_url)
              }
            >
              Remove
            </Button>
          </div>
        </Row>
      </Dropdown>
    );
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
    const showRegisterNameInput = (
      showUnregisteredDropdown && authStore.authenticated
    );
    const registeredName = (
      registerNameStatus.success ?
      registerNameStatus.snapName : snap.store_name
    );

    const hasBuilt = latestBuild && snap.snapcraft_data;
    const isActive = (
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
        <Data col="27"><Link to={ `/${fullName}/builds` }>{ fullName }</Link></Data>
        <Data col="15">
          { this.renderConfiguredStatus.call(this, snap.snapcraft_data) }
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
                colour={ latestBuild.status }
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
        { showUnconfiguredDropdown && this.renderUnconfiguredDropdown() }
        { showUnregisteredDropdown && this.renderUnregisteredDropdown() }
        { showRemoveDropdown && this.renderRemoveDropdown(registeredName) }
      </Row>
    );
  }

  renderConfiguredStatus(data) {
    if (!data) {
      return (
        <a onClick={this.onConfiguredClick.bind(this)}>Not configured</a>
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

  getTemplateUrl() {
    const templateUrl = url.format({
      protocol: 'https:',
      host: 'github.com',
      pathname: parseGitHubRepoUrl(this.props.snap.git_repository_url).fullName + '/new/master',
      query: {
        'filename': 'snap/snapcraft.yaml',
        'value': templateYaml
      }
    });

    return templateUrl;
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
