import React, { PropTypes } from 'react';
import { Link } from 'react-router';

import style from './button.css';

const defaultProps = {
  disabled: PropTypes.bool,
  children: PropTypes.string,
  onClick: PropTypes.func,
  type: PropTypes.string,
  appearance: React.PropTypes.oneOf(['primary', 'secondary', 'positive', 'neutral']),
  href: PropTypes.string
};

export default function Button(props) {
  const { appearance='primary', ...rest } = props;
  return <button {...rest} className={ style[appearance] } />;
}

export function Anchor(props) {
  const { appearance='primary', icon, ...rest } = props;
  return (
    <a {...rest} className={ style[appearance] }>
      { props.children }
      { icon && <img className= { style.icon } src={ icon } /> }
    </a>
  );
}

export function LinkButton(props) {
  const { appearance='primary', ...rest } = props;
  return <Link {...rest} className={ style[appearance] } />;
}

Button.propTypes = {
  ...defaultProps
};

Anchor.propTypes = {
  ...defaultProps
};

LinkButton.propTypes = {
  ...defaultProps
};
