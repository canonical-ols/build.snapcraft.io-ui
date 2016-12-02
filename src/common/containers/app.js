import React, { PropTypes, Component } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';

import Header from '../components/header';
import Footer from '../components/footer';
import Notification from '../components/notification';
import styles from './app.css';

export class App extends Component {
  render() {
    const { oyez } = this.props;

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
        <Header />
        <div className={ styles.staticNotifications }>
          { oyez && oyez.map((oy, i) => {
            return <Notification key={i} { ...oy } />;
          })}
        </div>
        { (!oyez || !oyez.length) && this.props.children }
        <Footer />
      </div>
    );
  }
}

App.propTypes = {
  children: PropTypes.node,
  oyez: PropTypes.array
};

function mapStateToProps(state) {
  const {
    oyez
  } = state;

  return {
    oyez
  };
}

export default connect(mapStateToProps)(App);
