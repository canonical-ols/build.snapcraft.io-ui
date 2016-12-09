import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import moment from 'moment';

import styles from './buildRow.css';

const BuildRow = (props) => {

  const {
    account,
    repo,
    architecture,
    buildId,
    duration,
    status,
    statusMessage,
    dateStarted,
    dateCompleted
  } = props;

  return (
    <div className={ `${styles.buildRow} ${styles[status]}` }>
      <div className={ styles.item }><Link to={`/${account}/${repo}/builds/${buildId}`}>{`#${buildId}`}</Link> {statusMessage}</div>
      <div className={ styles.item }>
        {architecture}
      </div>
      <div className={ styles.item }>
        {moment.duration(duration).humanize()}
      </div>
      <div className={ styles.item }>
        <span title={moment(dateCompleted || dateStarted).format('DD-MM-YYYY HH:mm:ss')}>{ moment(dateCompleted || dateStarted).fromNow() }</span>
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
