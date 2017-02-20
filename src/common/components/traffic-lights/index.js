import React, { Component, PropTypes } from 'react';

import styles from './traffic-light.css';

export class Signal extends Component {

  render() {
    const { walkdontwalk, stage } = this.props;

    const signalStyle = walkdontwalk ? styles.go : styles.stop;

    return (
      <div className={ `${styles.signal} ${signalStyle}` }>
        { !walkdontwalk && stage }
      </div>
    );
  }
}

Signal.propTypes = {
  walkdontwalk: PropTypes.bool,
  stage: PropTypes.string
};

export default class TrafficLights extends Component {

  render() {

    return (
      <div className={ styles.trafficlight }>
        <div className={ styles.box }>
          <Signal walkdontwalk={ true } stage="1" />
          <p>
            Connect to Github
          </p>
        </div>
        <div className={ styles.box }>
          <Signal walkdontwalk={ false } stage="2" />
          <p>
            Choose a repo
          </p>
        </div>
        <div className={ styles.box }>
          <Signal walkdontwalk={ false } stage="3" />
          <p>
            Name and YAML
          </p>
        </div>
      </div>
    );
  }
}

TrafficLights.propTypes = {
  active: PropTypes.bool
};
