import React, { PropTypes } from 'react';

import { conf } from '../../../helpers/config';

import Button from '../../vanilla/button';
import { Row, Data, Dropdown } from '../../vanilla/table-interactive';
import { TickIcon, ErrorIcon } from '../icons';

import styles from './dropdowns.css';

const FILE_NAME_CLAIM_URL = `${conf.get('STORE_DEVPORTAL_URL')}/click-apps/register-name/`;
const AGREEMENT_URL = `${conf.get('STORE_DEVPORTAL_URL')}/tos/`;

// partial component for rendering Developer Programme Aggreement checkbox
const Agreement = (props) => {
  const checkbox = <input type="checkbox" onChange={ props.onChange } />;
  const link = (
    <a
      className={ styles.external }
      href={ AGREEMENT_URL }
      target="_blank"
      rel="noreferrer noopener"
    >
      Developer Programme Agreement
    </a>
  );

  return (
    <div>
      { checkbox } I accept the terms of the { link }
    </div>
  );
};

Agreement.propTypes = {
  onChange: PropTypes.func.isRequired
};

// partial component for rendering caption of the dropdown based on current state
const Caption = (props) => {
  const {
    registeredName,
    authStore,
    registerNameStatus,
    onSignAgreementChange,
    snapName,
    snapcraftData,
    onSnapNameChange
  } = props;

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
  let changeForm;
  let message;

  const helpText = (
    <div className={ styles.helpText }>
      Lower-case letters, numbers, and hyphens only.
    </div>
  );

  const changeRegisteredName = !!registeredName;

  // only show "change name" info and form if there is a name registered already,
  // user is authenticated and we are not showing register success message
  const showChangeForm = (
    changeRegisteredName &&
    authStore.authenticated &&
    !registerNameStatus.success
  );

  const showHelpText = !showChangeForm && (authStoreFetchingDischarge || authStore.authenticated);

  if (changeRegisteredName) {
    // if user is changing already registered name
    if (!authStore.authenticated) {
      message = 'You need to sign in to Ubuntu One to change a snap’s registered name.';
    }
  } else {
    // if user is registering new name
    message = 'To publish to the snap store, this repo needs a registered name.';
    if (!authStore.authenticated) {
      message += ' You need to sign in to Ubuntu One to register a name.';
    }
  }

  if (showChangeForm) {
    changeForm = (
      <div>
        If you change the registered name:
        <ul>
          { snapcraftData.name === registeredName &&
            <li>Builds will stop until you update the snapcraft.yaml to match.</li>
          }
          <li>The old name will remain registered to you and can be used for another snap later.</li>
        </ul>
        <p>
          <label>New name:
            {' ' /* force space between inline elements */}
            <input
              className={ styles.snapNameInput }
              type='text'
              value={ snapName }
              onChange={ onSnapNameChange }
            />
          </label>
        </p>
        { helpText }
      </div>
    );
  }

  if (registerNameStatus.success) {
    caption = (
      <div>
        <TickIcon /> Registered successfully
      </div>
    );
  } else if ( registerNameStatus.error
    && registerNameStatus.error.json
    && registerNameStatus.error.json.payload
    && registerNameStatus.error.json.payload.code === 'already_registered') {
    caption = (
      <div>
        <p><ErrorIcon /> Sorry, that name is already taken. Try a different name.</p>
        <p className={ styles.helpText }>
          If you think you should have sole rights to the name,
          you can
          <a
            href={ FILE_NAME_CLAIM_URL }
            target='_blank'
            rel="noreferrer noopener"
          >
            file a claim
          </a>.
        </p>
      </div>
    );
  } else if (registerNameStatus.error) {
    caption = (
      <p><ErrorIcon /> { registerNameStatus.error.message }</p>
    );
  } else {
    caption = (
      <div>
        { message }
        { showHelpText && helpText }
        { userMustSignAgreement && <Agreement onChange={onSignAgreementChange}/> }
      </div>
    );
  }

  return (
    <div className={styles.caption}>
      { changeForm }
      { caption }
    </div>
  );
};

Caption.propTypes = {
  registeredName: PropTypes.string,
  snapName: PropTypes.string,
  snapcraftData: PropTypes.object,
  authStore: PropTypes.shape({
    authenticated: PropTypes.bool,
    hasDischarge: PropTypes.bool,
    signedAgreement: PropTypes.bool
  }),
  registerNameStatus: PropTypes.shape({
    isFetching: PropTypes.bool,
    success: PropTypes.bool,
    error: PropTypes.object
  }),

  onSignAgreementChange: PropTypes.func.isRequired,
  onSnapNameChange: PropTypes.func.isRequired
};

// partial component to render action buttons of the dropdown based on current state
const ActionButtons = (props) => {
  const { authStore, registeredName, registerNameStatus, snapName } = props;
  const { onCancelClick, onSignInClick, onRegisterClick } = props;

  // by default show 'Sign in' button
  let actionText = 'Sign in...';
  let actionOnClick = onSignInClick;
  let actionDisabled = !!registerNameStatus.error;
  let actionSpinner = false;

  if (authStore.isFetching || registerNameStatus.isFetching) {
    // if we are fetching data show loading button
    actionDisabled = true;
    actionSpinner = true;
    actionText = 'Checking...';
  } else if (authStore.authenticated) {
    // if user already signed in, show 'Register' button
    actionDisabled = (
      snapName === '' ||
      !!registerNameStatus.error
    );
    actionText = registeredName ? 'Register new name' : 'Register name';
    actionOnClick = onRegisterClick;
  }

  return (
    <div className={ styles.buttonRow }>
      <a onClick={onCancelClick} className={ styles.cancel }>
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
  );
};

ActionButtons.propTypes = {
  snapName: PropTypes.string,
  authStore: PropTypes.shape({
    authenticated: PropTypes.bool,
    isFetching: PropTypes.bool
  }),
  registeredName: PropTypes.string,
  registerNameStatus: PropTypes.shape({
    isFetching: PropTypes.bool,
    success: PropTypes.bool,
    error: PropTypes.object
  }),

  onRegisterClick: PropTypes.func.isRequired,
  onSignInClick: PropTypes.func.isRequired,
  onCancelClick: PropTypes.func.isRequired,
};

// main dropdown component exported from this module
const RegisterNameDropdown = (props) => {
  return (
    <Dropdown>
      <Row>
        <Data col="100">
          <Caption
            registeredName={props.registeredName}
            snapName={props.snapName}
            snapcraftData={props.snapcraftData}
            authStore={props.authStore}
            registerNameStatus={props.registerNameStatus}
            onSignAgreementChange={props.onSignAgreementChange}
            onSnapNameChange={props.onSnapNameChange}
          />
        </Data>
      </Row>
      <Row>
        <ActionButtons
          authStore={props.authStore}
          registeredName={props.registeredName}
          registerNameStatus={props.registerNameStatus}
          snapName={props.snapName}
          onRegisterClick={props.onRegisterClick}
          onSignInClick={props.onSignInClick}
          onCancelClick={props.onCancelClick}
        />
      </Row>
    </Dropdown>
  );
};

RegisterNameDropdown.propTypes = {
  snapName: PropTypes.string,
  authStore: PropTypes.object,
  registeredName: PropTypes.string,
  registerNameStatus: PropTypes.object,
  snapcraftData: PropTypes.object,
  onSnapNameChange: PropTypes.func.isRequired,
  onSignAgreementChange: PropTypes.func.isRequired,
  onRegisterClick: PropTypes.func.isRequired,
  onSignInClick: PropTypes.func.isRequired,
  onCancelClick: PropTypes.func.isRequired,
};

export default RegisterNameDropdown;
