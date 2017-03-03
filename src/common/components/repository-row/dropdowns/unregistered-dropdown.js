import React, { PropTypes } from 'react';

import { conf } from '../../../helpers/config';

import Button from '../../vanilla/button';
import { Row, Data, Dropdown } from '../../vanilla/table-interactive';
import { Message } from '../../forms';
import { TickIcon } from '../icons';

import styles from './dropdowns.css';

const FILE_NAME_CLAIM_URL = `${conf.get('STORE_DEVPORTAL_URL')}/click-apps/register-name/`;
const AGREEMENT_URL = `${conf.get('STORE_DEVPORTAL_URL')}/tos/`;

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

const UnregisteredDropdown = (props) => {
  const { authStore, registerNameStatus, snapName } = props;
  const {
    onSignAgreementChange,
    onRegisterClick,
    onSignInClick,
    onCancelClick
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
        To publish to the snap store, this repo needs a registered name.
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
      snapName === '' ||
      registerNameStatus.isFetching ||
      !!registerNameStatus.error
    );
    actionOnClick = onRegisterClick;
    if (registerNameStatus.isFetching) {
      actionSpinner = true;
      actionText = 'Checking...';
    } else {
      actionText = 'Register name';
    }
  } else {
    actionDisabled = !!registerNameStatus.error;
    actionOnClick = onSignInClick.bind(this);
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
      </Row>
    </Dropdown>
  );
};

UnregisteredDropdown.propTypes = {
  snapName: PropTypes.string,
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

  onSignAgreementChange: PropTypes.func.isRequired,
  onRegisterClick: PropTypes.func.isRequired,
  onSignInClick: PropTypes.func.isRequired,
  onCancelClick: PropTypes.func.isRequired,
};

export default UnregisteredDropdown;
