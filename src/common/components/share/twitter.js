import React, { Component, PropTypes } from 'react';

import styles from './styles.css';

export class Tweet extends Component {
  render() {
    const { name } = this.props;
    const text = encodeURIComponent(
      `Install ${name} in seconds on Linux OSes:\nsudo snap install ${name}\n\n(Don’t have snapd? https://snapcraft.io/docs/core/install)`
    );

    return (
      <a
        className={ `${styles.share} ${styles.tweet}`}
        href={`https://twitter.com/intent/tweet?text=${text}`}
      />
    );
  }
}

Tweet.propTypes = {
  name: PropTypes.string.isRequired
};
