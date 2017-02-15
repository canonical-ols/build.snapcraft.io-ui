import React, { PropTypes } from 'react';
import styles from './list-divided-state.css';

export default function ListDividedState(props) {
  const className = props.className || '';

  return (
    <div className={`${styles.listDividedState} ${className}`}>
      { props.children }
    </div>
  );
}

ListDividedState.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string
};
