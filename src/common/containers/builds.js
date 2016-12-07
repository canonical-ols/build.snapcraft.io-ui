import React, { PropTypes } from 'react';
import Helmet from 'react-helmet';

import styles from './container.css';

const Builds = (props) => {
  const { account, repo } = props.params;
  const name = `${account}/${repo}`;

  return (
    <div className={ styles.container }>
      <Helmet
        title={`${name} builds`}
      />
      {/* TODO: make into title component? */}
      <h1>{name} builds</h1>
    </div>
  );
};

Builds.propTypes = {
  params: PropTypes.shape({
    account: PropTypes.string.isRequired,
    repo: PropTypes.string.isRequired,
  }),
};

export default Builds;
