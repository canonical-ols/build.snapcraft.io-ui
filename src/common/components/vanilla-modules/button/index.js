import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import classNames from 'classnames';

import Spinner from '../../spinner';

import style from '../../../style/vanilla/css/button.css';

// XXX this additonal spinner styles are needed to support non-vanilla spinner in buttons
import spinnerStyle from './buttonSpinner.css';

function createButtonComponent(Component) {
  function ButtonComponent(props) {
    const { appearance='primary', isSpinner=false, ...rest } = props;
    const buttonStyle = `p-button--${appearance}`;
    const className = classNames({
      [style[buttonStyle]]: true,
      [spinnerStyle.hasSpinner]: isSpinner
    });

    return (
      <Component {...rest} className={ className }>
        { isSpinner &&
          <span className={ spinnerStyle.spinner }><Spinner light/></span>
        }
        <span className={spinnerStyle.text}>{ props.children }</span>
      </Component>
    );
  }

  ButtonComponent.propTypes = {
    isSpinner: PropTypes.bool,
    disabled: PropTypes.bool,
    children: PropTypes.node,
    onClick: PropTypes.func,
    appearance: React.PropTypes.oneOf(['positive', 'negative', 'neutral', 'base', 'brand']),
    href: PropTypes.string
  };

  return ButtonComponent;
}

const Button = createButtonComponent('button');
Button.displayName = 'Button';

const Anchor = createButtonComponent('a');
Anchor.displayName = 'Anchor';

const LinkButton = createButtonComponent(Link);
LinkButton.displayName = 'LinkButton';

export {
  Button as default,
  Anchor,
  LinkButton
};
