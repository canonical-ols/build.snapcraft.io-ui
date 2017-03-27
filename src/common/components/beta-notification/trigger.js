import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import localforage from 'localforage';

import { BETA_NOTIFICATION_TOGGLE } from '../../reducers/beta-notification';
import { BETA_NOTIFICATION_DISMISSED_KEY } from './index';

const BETA_NOTIFICATION_TIMEOUT = 2 * 60 * 1000; // 2 minutes

class BetaNotificationTriggerRaw extends Component {
  notificationTimeout = null;

  async componentDidMount() {
    const notificationDismissed = await localforage.getItem(BETA_NOTIFICATION_DISMISSED_KEY);

    if (this.props.auth.authenticated && !notificationDismissed) {
      this.notificationTimeout = setTimeout(() => {
        this.props.dispatch({
          type: BETA_NOTIFICATION_TOGGLE,
          payload: true
        });
      }, BETA_NOTIFICATION_TIMEOUT);
    }
  }

  componentWillUnmount() {
    clearTimeout(this.notificationTimeout);
  }

  render() {
    return null; // we don't render anything
  }
}

BetaNotificationTriggerRaw.propTypes = {
  auth: PropTypes.object,
  dispatch: PropTypes.func
};

function mapStateToProps(state) {
  const {
    auth
  } = state;

  return {
    auth
  };
}

export default connect(mapStateToProps)(BetaNotificationTriggerRaw);
