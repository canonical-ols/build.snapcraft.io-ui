import React, { PropTypes, Component } from 'react';
import Helmet from 'react-helmet';

import HelloWorld from '../components/hello-world';

import styles from './container.css';

export default class Home extends Component {

  render() {
    return (
      <div className={ styles.container }>
        <Helmet
          title='Home'
        />
        <HelloWorld />
      </div>
    );
  }
}
