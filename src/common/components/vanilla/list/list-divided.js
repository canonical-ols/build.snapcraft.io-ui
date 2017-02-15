import React, { PropTypes } from 'react';
import styles from './list-divided.css';

export default function ListDivided(props) {
  const className = props.className || '';

  return (
    <div className={`${styles.listDivided} ${className}`}>
      { props.children }
    </div>
  );
}

ListDivided.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string
};
