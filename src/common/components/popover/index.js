import React, { PropTypes } from 'react';

import styles from './popover.css';

const Popover = (props) => {
  return (
    <div className={styles.popover} style={{ top: `${props.top}px`, left:`${props.left}px` }}>
      {props.children}
    </div>
  );
};

Popover.propTypes = {
  left: PropTypes.number,
  top: PropTypes.number,
  children: PropTypes.node
};

export default Popover;
