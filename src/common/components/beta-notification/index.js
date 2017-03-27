import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { BETA_NOTIFICATION_TOGGLE } from '../../reducers/beta-notification';
import Notification from '../vanilla/notification';

const SURVEY_LINK = 'https://docs.google.com/forms/d/e/1FAIpQLSeCAKWHb4w-iNrg-YqyiRVMHULDlZMx9bXyK9a7s40sXYjQzQ/viewform?usp=sf_link';

class BetaNotification extends Component {

  onRemoveClick(event) {
    event.preventDefault();

    this.props.dispatch({
      type: BETA_NOTIFICATION_TOGGLE,
      payload: false
    });
    // TODO: store notification as dismissed (in localstorage)
  }

  render() {
    return this.props.betaNotification.notificationVisible
      ? (
        <Notification onRemoveClick={this.onRemoveClick.bind(this)}>
          Hey, got a spare five minutes to <a href={SURVEY_LINK} target="_blank" rel="noopener noreferrer"> give us some feedback</a>?
        </Notification>
      )
      : null;
  }
}

BetaNotification.propTypes = {
  betaNotification: PropTypes.object,
  dispatch: PropTypes.func
};

function mapStateToProps(state) {
  return {
    betaNotification: state.betaNotification
  };
}

export default connect(mapStateToProps)(BetaNotification);
