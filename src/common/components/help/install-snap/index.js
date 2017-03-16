import React, { Component, PropTypes } from 'react';

import { HeadingThree } from '../../vanilla/heading/';
import styles from './help-install-snap.css';

const HELP_INSTALL_URL = 'https://snapcraft.io/docs/core/install';

export default class HelpInstallSnap extends Component {
  render() {
    const { children, headline, name, revision } = this.props;
    const revOption = revision ? `--revision=${ revision }` : '';
    const command = children || `sudo snap install --edge ${name} ${revOption}`;

    return (
      <div className={ styles.strip }>
        <HeadingThree>{ headline }</HeadingThree>
        <pre>
          <code className={ styles.cli }>
            {command}
          </code>
        </pre>
        <p className={ styles.p }>
          Don’t have snapd installed? <a className={ styles.external } href={ HELP_INSTALL_URL } target="_blank">Install it now</a>.
        </p>
      </div>
    );
  }
}

HelpInstallSnap.propTypes = {
  headline: PropTypes.string.isRequired,
  // name is only required if there is no children specified
  name: (props, propName, componentName) => {
    if (typeof props.children === 'undefined' && typeof props[propName] !== 'string') {
      return new Error(`The prop '${propName}' in ${componentName} should be a string if no children are specified.`);
    }
  },
  revision: PropTypes.number,
  children: PropTypes.node
};
