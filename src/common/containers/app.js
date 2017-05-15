import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import Clipboard from 'clipboard';

import Header from '../components/header';
import Footer from '../components/footer';
import COPY_TO_CLIPBOARD_SELECTOR from '../components/share/';

import BetaNotificationTrigger from '../components/beta-notification/trigger';

export class App extends Component {
  componentDidMount() {
    new Clipboard(`.${COPY_TO_CLIPBOARD_SELECTOR}`);
  }
  render() {
    return (
      <div>
        <Helmet
          htmlAttributes={{ 'lang': 'en' }}
          titleTemplate='build.snapcraft.io - %s'
          defaultTitle='build.snapcraft.io'
          meta={[
            { 'name': 'description', 'content': 'build.snapcraft.io' },
          ]}
        />
        <BetaNotificationTrigger />
        <Header
          authenticated={this.props.auth.authenticated}
          user={this.props.user}
          dispatch={this.props.dispatch}
        />
        { this.props.children }
        <Footer />
      </div>
    );
  }
}

App.propTypes = {
  children: PropTypes.node,
  auth: PropTypes.object,
  user: PropTypes.object,
  dispatch: PropTypes.func
};

function mapStateToProps(state) {
  const {
    auth,
    user
  } = state;

  return {
    auth,
    user
  };
}

export default connect(mapStateToProps)(App);
