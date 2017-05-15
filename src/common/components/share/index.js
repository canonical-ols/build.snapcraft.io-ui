import React, { Component, PropTypes } from 'react';

import styles from './styles.css';

export const COPY_TO_CLIPBOARD_SELECTOR = 'copyToClipboard';

export class CopyToClipboard extends Component {
  render() {
    const { copyme } = this.props;

    return (
      <span
        title="Copy to clipboard"
        className={`${styles.share} ${styles.clipboard}`}
        data-clipboard-action="copy"
        data-clipboard-text={ copyme }
      />
    );
  }
}

CopyToClipboard.propTypes = {
  copyme: PropTypes.string
};
