import React, { Component, PropTypes } from 'react';
import Clipboard from 'clipboard';

import styles from './styles.css';

const COPY_TO_CLIPBOARD_CLASS = styles.clipboard;

export class CopyToClipboard extends Component {
  componentDidMount() {
    new Clipboard(`.${COPY_TO_CLIPBOARD_CLASS}`);
  }
  render() {
    const { copyme } = this.props;

    return (
      <span
        title="Copy to clipboard"
        className={`${styles.share} ${COPY_TO_CLIPBOARD_CLASS}`}
        data-clipboard-action="copy"
        data-clipboard-text={ copyme }
      />
    );
  }
}

CopyToClipboard.propTypes = {
  copyme: PropTypes.string
};
