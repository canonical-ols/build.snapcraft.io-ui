import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { BETA_NOTIFICATION_TOGGLE } from '../../reducers/beta-notification';

const BETA_NOTIFICATION_TIMEOUT = 2 * 60 * 1000; // 2 minutes

class BetaNotificationTriggerRaw extends Component {
  notificationTimeout = null;

  componentDidMount() {
    if (this.props.auth.authenticated) {
      // TODO: check if notification was dismissed (in localstorage)

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
