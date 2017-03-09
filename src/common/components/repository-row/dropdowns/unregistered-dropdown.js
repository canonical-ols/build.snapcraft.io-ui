import React, { PropTypes } from 'react';

import { conf } from '../../../helpers/config';

import Button from '../../vanilla/button';
import { Row, Data, Dropdown } from '../../vanilla/table-interactive';
import { Message } from '../../forms';
import { TickIcon } from '../icons';

import styles from './dropdowns.css';

const FILE_NAME_CLAIM_URL = `${conf.get('STORE_DEVPORTAL_URL')}/click-apps/register-name/`;
const AGREEMENT_URL = `${conf.get('STORE_DEVPORTAL_URL')}/tos/`;

// partial component for rendering Developer Programme Aggreement checkbox
const Agreement = (props) => {
  const checkbox = <input type="checkbox" onChange={ props.onChange } />;
  const link = (
    <a className={ styles.external } href={ AGREEMENT_URL } target="_blank">
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

  const changeRegisteredName = !!registeredName;

  // only show "change name" info and form if there is a name registered already,
  // user is authenticated and we are not showing register success message
  const showChangeForm = (
    changeRegisteredName &&
    authStore.authenticated &&
    !registerNameStatus.success
  );

  if (showChangeForm) {
    changeForm = (
      <div>
        If you change the registered name:
        <ul>
          <li>The old name will remain registered to you and can be used for another snap later.</li>
        </ul>
        <p>New name:
          <input
            type='text'
            value={ snapName }
            onChange={ onSnapNameChange }
          />
        </p>
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
        { !changeRegisteredName &&
          'To publish to the snap store, this repo needs a registered name.'
        }
        { !authStore.authenticated &&
          ' You need to sign in to Ubuntu One to register a name.'
        }
        { (authStoreFetchingDischarge || authStore.authenticated) &&
          <div className={ styles.helpText }>
            Lower-case letters, numbers, and hyphens only.
          </div>
        }
        { userMustSignAgreement && <Agreement onChange={onSignAgreementChange}/> }
      </div>
    );
  }

  return (
    <div>
      { changeForm }
      { caption }
    </div>
  );
};

Caption.propTypes = {
  registeredName: PropTypes.string,
  snapName: PropTypes.string,
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
  const { authStore, registerNameStatus, snapName } = props;
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
    actionText = 'Register name';
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
const UnregisteredDropdown = (props) => {
  return (
    <Dropdown>
      <Row>
        <Data col="100">
          <Caption
            registeredName={props.registeredName}
            snapName={props.snapName}
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

UnregisteredDropdown.propTypes = {
  snapName: PropTypes.string,
  authStore: PropTypes.object,
  registeredName: PropTypes.string,
  registerNameStatus: PropTypes.object,
  onSnapNameChange: PropTypes.func.isRequired,
  onSignAgreementChange: PropTypes.func.isRequired,
  onRegisterClick: PropTypes.func.isRequired,
  onSignInClick: PropTypes.func.isRequired,
  onCancelClick: PropTypes.func.isRequired,
};

export default UnregisteredDropdown;
