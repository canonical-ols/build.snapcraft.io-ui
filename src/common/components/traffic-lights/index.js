import React, { Component, PropTypes } from 'react';

import styles from './traffic-light.css';

export class Signal extends Component {

  render() {
    const { done, stage, message } = this.props;

    const signalStyle = done ? styles.go : styles.stop;

    return (
      <div className={ styles.box }>
        <div className={ `${styles.signal} ${signalStyle}` }>
          { !done && stage }
        </div>
        <p>{ message }</p>
      </div>
    );
  }
}

Signal.propTypes = {
  done: PropTypes.bool,
  stage: PropTypes.string,
  message: PropTypes.string
};

export default class TrafficLights extends Component {

  render() {

    return (
      <div className={ styles.trafficlight }>
        <Signal
          done={ true }
          stage="1"
          message="Connect to Github"
        />
        <Signal
          done={ false }
          stage="2"
          message="Choose a repo"
        />
        <Signal
          done={ false }
          stage="3"
          message="Name and YAML"
        />
      </div>
    );
  }
}

TrafficLights.propTypes = {
  active: PropTypes.bool
};
