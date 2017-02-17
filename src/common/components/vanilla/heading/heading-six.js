import React, { PropTypes } from 'react';
import styles from './heading-six.css';

export default function HeadingSix(props) {
  return (
    <h4 className={ styles['heading-six'] }>
      { props.children }
    </h4>
  );
}

HeadingSix.propTypes = {
  children: PropTypes.node
};
