import React, { PropTypes } from 'react';
import { Link } from 'react-router';

import styles from './buildRow.css';

const BuildRow = (props) => {

  const {
    account,
    repo,
    username,
    commitMessage,
    buildId,
    duration,
    status,
    statusMessage,
    commitId,
    dateStarted,
    dateCompleted
  } = props;

  return (
    <div className={ `${styles.buildRow} ${styles[status]}` }>
      <div className={ styles.item }>{username}</div>
      <div className={ styles.item }>{commitMessage}</div>
      <div className={ styles.item }>
        <Link to={`/${account}/${repo}/builds/${buildId}`}>{`#${buildId}`}</Link> {statusMessage}
        <br/>
        {commitId}
      </div>
      <div className={ styles.item }>
        {duration}<br/>
        on { dateCompleted || dateStarted }
      </div>
    </div>
  );
};

BuildRow.propTypes = {
  // params from URL
  account: PropTypes.string,
  repo: PropTypes.string,

  // build properties
  buildId:  PropTypes.string,
  username: PropTypes.string,
  commitId:  PropTypes.string,
  commitMessage:  PropTypes.string,
  architecture: PropTypes.string,
  status:  PropTypes.oneOf(['success', 'error', 'pending']),
  statusMessage: PropTypes.string,
  dateStarted: PropTypes.string,
  dateCompleted: PropTypes.string,
  duration: PropTypes.string
};

export default BuildRow;
