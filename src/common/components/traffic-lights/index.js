import React, { Component, PropTypes } from 'react';

import styles from './traffic-light.css';

export const SIGNALS = {
  DEFAULT: 0,
  ACTIVE: 1,
  DONE: 2
};

const stateStyles = [
  '', // use default style of element
  styles.active,
  styles.done
];

export class Signal extends Component {

  render() {
    const { state, label, message } = this.props;
    const signalStyle = stateStyles[state];

    let labelOut;

    if (state === SIGNALS.DONE) {
      labelOut = '\u00a0';
    } else {
      labelOut = label;
    }

    return (
      <div className={ styles.box }>
        <div className={ `${styles.signal} ${signalStyle}` }>
          { labelOut }
        </div>
        <p>{ message }</p>
      </div>
    );
  }
}

Signal.propTypes = {
  state: PropTypes.number.required,
  label: PropTypes.string.required,
  message: PropTypes.string
};

export default class TrafficLights extends Component {

  constructor(props) {
    super(props);

    const { signalState } = this.props;

    this.state = {
      signals: [{
        label: '1',
        message: 'Connect to Github'
      }, {
        label: '2',
        message: 'Choose a repo'
      }, {
        label: '3',
        message: 'Name and YAML'
      }]
    };

    this.mergeSignalState(this.state.signals, signalState);
  }

  componentWillReceiveProps(nextProps) {
    const { signalState } = nextProps;

    this.mergeSignalState(this.state.signals, signalState);
  }

  mergeSignalState(signals, state) {
    signals.forEach((signal, index, array) => {
      array[index] = {
        ...signal,
        state: state[index]
      };
    });
  }

  render() {

    return (
      <div className={ styles.trafficlight }>
        {this.state.signals.map((signal, key) => {
          return (
            <Signal
              key= { key }
              state={ signal.state }
              label={ signal.label }
              message={ signal.message }
            />
          );
        })}
      </div>
    );
  }
}

TrafficLights.propTypes = {
  signalState: PropTypes.array
};
