import React, { Component, PropTypes } from 'react';

import { HeadingOne } from '../vanilla/heading';

import styles from './firstTimeHeading.css';

const hasStoreName = (snap) => snap.store_name;
const hasStoreNameAndSnapcraftData = (snap) => snap.store_name && snap.snapcraft_data;
const hasStoreNameButNotSnapcraftData = (snap) => snap.store_name && !snap.snapcraft_data;

class FirstTimeHeading extends Component {

  getHeadingText() {
    const snapsStore = this.props.snaps;
    const snaps = snapsStore.snaps;

    let message = null;

    if (snapsStore.success) {
      // no repos added yet

      if (snaps.length === 0) {
        message = 'Let’s get started! First, choose one or more GitHub repos for building.';
      // at least one repo, but none have a name yet
      } else if (snaps.filter(hasStoreName).length === 0) {
        message = 'Great! To publish a snap to the Store, it needs a unique name. Try registering one now.';
      // at least one repo has a name but no snapcraft.yaml, and none have both
      } else if (snaps.filter(hasStoreNameButNotSnapcraftData).length &&
                 snaps.filter(hasStoreNameAndSnapcraftData).length === 0) {
        message = 'Okay, your repo is registered. Now push a snapcraft.yaml file, and building will start.';
      }
      // TODO: bartaz add last check for build in one repository
    }

    return message;
  }
  render() {
    const message = this.getHeadingText();

    return (
      message
        ? <div className={styles.firstTimeHeading}>
          <HeadingOne>{this.getHeadingText()}</HeadingOne>
        </div>
        : null
    );
  }
}

FirstTimeHeading.propTypes = {
  snaps: PropTypes.object,
  snapBuilds: PropTypes.object
};

export default FirstTimeHeading;
