import React, { PropTypes } from 'react';
import { Link } from 'react-router';

import { BuildStatusConstants } from '../../helpers/snap-builds';

import styles from './buildStatus.css';

const BuildStatus = (props) => {

  const {
    link,
    status,
    statusMessage
  } = props;

  const statusStyle = {
    [BuildStatusConstants.SUCCESS]: styles.success,
    [BuildStatusConstants.ERROR]: styles.error,
    [BuildStatusConstants.PENDING]: styles.pending
  };

  return (
    <div className={ `${styles.buildStatus} ${statusStyle[status]}` }>
      { link
        ? <Link to={link}>{statusMessage}</Link>
        : <span>{statusMessage}</span>
      }
    </div>
  );
};

BuildStatus.propTypes = {
  link: PropTypes.string,
  status:  PropTypes.string,
  statusMessage: PropTypes.string,
};

export default BuildStatus;
