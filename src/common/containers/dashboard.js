import React, { Component } from 'react';
import Helmet from 'react-helmet';

import RepositoriesHome from '../components/repositories-home';
import TrafficLights from '../components/traffic-lights';
import styles from './container.css';

class Dashboard extends Component {
  render() {
    return (
      <div className={ styles.container }>
        <Helmet
          title='Home'
        />
        <TrafficLights />
        <RepositoriesHome />
      </div>
    );
  }
}

export default Dashboard;
