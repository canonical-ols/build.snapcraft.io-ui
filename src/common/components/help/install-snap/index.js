import React, { Component } from 'react';

import HeadingThree from '../../vanilla/heading/';
import styles from './help-install-snap.css';

const HELP_INSTALL_URL = '';

export default class HelpInstallSnap extends Component {
  render() {
    const { name, revision } = this.props;

    return (
      <div className={ styles.strip }>
        <div>
          <div className={ styles.cli }>
            sudo snap install --edge {name} --revision={revision}
          </div>
        </div>
        <div>Don’t have snapd installed? <a href={ HELP_INSTALL_URL }>Install it now</a>.</div>
      </div>
    );
  }
}
