import { PropTypes, Component } from 'react';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';

import { routeRedirectUrl } from '../../actions/route-urls.js';

class EnsureLoggedIn extends Component {
  componentDidMount() {
    const { dispatch, currentUrl, isLoggedIn } = this.props;

    if (!isLoggedIn) {
      dispatch(routeRedirectUrl(currentUrl));
      browserHistory.replace('/');
    }
  }

  render() {
    const { isLoggedIn } = this.props;

    if (isLoggedIn) {
      return this.props.children;
    } else {
      return null;
    }
  }
}

EnsureLoggedIn.propTypes = {
  auth: PropTypes.object,
  children: PropTypes.node,
  currentUrl: PropTypes.string,
  dispatch: PropTypes.func,
  isLoggedIn: PropTypes.bool
};

function mapStateToProps(state, ownProps) {
  return {
    isLoggedIn: state.auth.authenticated,
    currentURL: ownProps.location.pathname
  };
}

export default connect(mapStateToProps)(EnsureLoggedIn);
