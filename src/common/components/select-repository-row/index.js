import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

import styles from './selectRepositoryRow.css';

class SelectRepositoryRow extends Component {

  render() {
    const {
      errorMsg,
      repository,
      onChange,
      isEnabled // is repository already enabled as a snap build
    } = this.props;

    // TODO tidy up when we get rid of prefixes
    const isChecked = repository.isSelected || isEnabled;
    const isFetching = repository.isFetching;
    const isDisabled = isEnabled || isFetching || !repository.isAdmin;

    const rowClass = classNames({
      [styles.repositoryRow]: true,
      [styles.error]: errorMsg,
      [styles.disabled]: isEnabled || !repository.isAdmin
    });

    const tooltip = !repository.isAdmin ? 'You don’t have admin permission for this repo' : '';

    return (
      <label htmlFor={ repository.fullName } className={ rowClass } title={tooltip}>
        <input
          id={ repository.fullName }
          type="checkbox"
          onChange={ onChange }
          checked={ isChecked }
          disabled={ isDisabled }
        />
        { repository.fullName }
        { errorMsg &&
          <div className={ styles.errorMessage }>
            { errorMsg }
          </div>
        }
      </label>
    );
  }
}

SelectRepositoryRow.defaultProps = {
  isSelected: false,
  isEnabled: false
};

SelectRepositoryRow.propTypes = {
  errorMsg: PropTypes.node,
  repository: PropTypes.shape({
    fullName: PropTypes.string.isRequired
  }).isRequired,
  isEnabled: PropTypes.bool,
  onChange: PropTypes.func,
  isSelected: PropTypes.bool
};

export default SelectRepositoryRow;
