import React, { PropTypes } from 'react';

import style from './message.css';

export default function Message({ status, text }) {

  return <div>
    { text &&
      <p className={ style[status] }>{ text }</p>
    }
  </div>;
}

Message.propTypes = {
  text: PropTypes.string,
  status: PropTypes.oneOf([ 'error', 'success', 'info', 'warning' ])
};
