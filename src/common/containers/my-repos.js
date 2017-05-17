import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';

import BetaNotification from '../components/beta-notification';
import RepositoriesHome from '../components/repositories-home';
import UserAvatar from '../components/user-avatar';
import styles from './container.css';

class MyRepos extends Component {
  render() {
    return (
      <div className={ styles.container }>
        <Helmet
          title='Home'
        />
        <BetaNotification />
        <UserAvatar />
        <RepositoriesHome hasJustSignedIn={this.props.hasJustSignedIn}/>
      </div>
    );
  }
}

MyRepos.propTypes = {
  hasJustSignedIn: PropTypes.bool
};

function mapStateToProps(state, ownProps) {
  return {
    hasJustSignedIn: ownProps.location.query['sign-in'] !== undefined
  };
}

export default connect(mapStateToProps)(MyRepos);
