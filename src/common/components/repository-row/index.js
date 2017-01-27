import React, { PropTypes } from 'react';

import Button from '../button';

import styles from './repositoryRow.css';

const RepositoryRow = (props) => {

  const {
    repository,
    buttonLabel,
    buttonDisabled,
    onButtonClick
  } = props;

  return (
    <div className={ styles.repositoryRow }>
      <div>
        {repository.fullName}
      </div>
      { onButtonClick &&
        <Button disabled={buttonDisabled} onClick={onButtonClick}>
          { buttonLabel }
        </Button>
      }
    </div>
  );
};

RepositoryRow.propTypes = {
  repository: PropTypes.shape({
    fullName: PropTypes.string
  }),
  buttonLabel: PropTypes.string.isRequired,
  buttonDisabled: PropTypes.bool,
  onButtonClick: PropTypes.func
};

export default RepositoryRow;
