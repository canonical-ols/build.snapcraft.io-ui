import React, { PropTypes } from 'react';

import styles from './tooltip.css';

const Tooltip = (props) => {
  return (
    <div className={styles.tooltip} style={{ top: `${props.top}px`, left:`${props.left}px` }}>
      {props.children}
    </div>
  );
};

Tooltip.propTypes = {
  left: PropTypes.number,
  top: PropTypes.number,
  children: PropTypes.node
};

export default Tooltip;
