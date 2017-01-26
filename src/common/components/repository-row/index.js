import React, { PropTypes } from 'react';

import Button from '../button';

import styles from './repositoryRow.css';

const RepositoryRow = (props) => {

  const {
    repository,
    onClick
  } = props;

  return (
    <div className={ styles.repositoryRow }>
      <div>
        {repository.full_name}
      </div>
      { onClick &&
        <Button onClick={onClick}>Create</Button>
      }
    </div>
  );
};

RepositoryRow.propTypes = {
  repository: PropTypes.object,
  onClick: PropTypes.func
};

export default RepositoryRow;
