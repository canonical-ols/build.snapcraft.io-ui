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
        {repository.fullName}
      </div>
      { onClick &&
        <Button onClick={onClick}>Create</Button>
      }
    </div>
  );
};

RepositoryRow.propTypes = {
  repository: PropTypes.shape({
    fullName: PropTypes.string
  }),
  onClick: PropTypes.func
};

export default RepositoryRow;
