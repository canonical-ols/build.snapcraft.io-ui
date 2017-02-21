import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { Anchor } from '../components/vanilla/button';
import { HeadingOne } from '../components/vanilla/heading';
import { ListDividedState } from '../components/vanilla/list';

import containerStyles from './container.css';
import styles from './landing.css';

import * as images from '../images';

class Landing extends Component {
  render() {
    return (
      <div>
        <div className={ containerStyles.lightStrip }>
          <div>
            <div className={ containerStyles.wrapper }>
              <HeadingOne>
                Auto-build and publish software<br />for any Linux system or device
              </HeadingOne>

              <ul className={ styles.banner }>
                <li className={ styles.bannerImage }>
                  <img src={images.banner} />
                </li>

                <li className={ styles.bannerLabel }>
                  Push to GitHub
                </li>
                <li className={ styles.bannerLabel }>
                  Built automatically
                </li>
                <li className={ styles.bannerLabel }>
                  Published for your users
                </li>
              </ul>

              <div className={ styles.bannerButton }>
                <Anchor  href="/auth/authenticate">Set up in minutes</Anchor>
              </div>
            </div>
          </div>
        </div>

        <section className={styles.section}>
          <div className={ `${styles.row} ${containerStyles.wrapper}` }>
            <ListDividedState className={ styles.rowItemGrow }>
              <li>Scale to millions of installs</li>
              <li>Available on all clouds and Linux OSes</li>
              <li>No need for build infrastructure</li>
            </ListDividedState>

            <ListDividedState className={ styles.rowItemGrow }>
              <li>Automatic updates for everyone</li>
              <li>Roll back versions effortlessly</li>
              <li>FREE for open source projects</li>
            </ListDividedState>
          </div>
        </section>

        <section className={styles.section}>
          <div className={ `${styles.row} ${containerStyles.wrapper}` }>
            <img className={ styles.brandLogo } src={images.ubuntu} />
            <img className={ styles.brandLogo } src={images.archlinux} />
            <img className={ styles.brandLogo } src={images.debian} />
            <img className={ styles.brandLogo } src={images.gentoo} />
            <img className={ styles.brandLogo } src={images.fedora} />
            <img className={ styles.brandLogo } src={images.opensuse} />
          </div>
        </section>

        <section className={styles.section}>

          <div className={ `${styles.row} ${containerStyles.wrapper}` }>

            <div className={styles.workflowItemOneThrid}>
              <img className={styles.workflowImage} src='https://assets.ubuntu.com/v1/3fb11c60-workflow-icon01.svg' />
              <p>You receive a pull request on GitHub</p>
            </div>

            <div className={styles.workflowItemOneThrid}>
              <img className={styles.workflowImage} src='https://assets.ubuntu.com/v1/13effe35-workflow-icon02.svg' />
              <p>Tested with your existing integration system, such as Travis</p>
            </div>

            <div className={styles.workflowItemOneThrid}>
              <img className={styles.workflowImage} src='https://assets.ubuntu.com/v1/24c102a8-workflow-icon03.svg' />
              <p>The code lands on master</p>
            </div>

          </div>

          <div className={ `${styles.row} ${containerStyles.wrapper}` }>

            <div className={styles.workflowItemOneThrid}>
              <img className={styles.workflowImage} src='https://assets.ubuntu.com/v1/7af63a6d-workflow-icon04.svg' />
              <p>Snapcraft builds a new snap version</p>
            </div>

            <div className={styles.workflowItemOneThrid}>
              <img className={styles.workflowImage} src='https://assets.ubuntu.com/v1/6cfc526e-workflow-icon05.svg' />
              <p>Published to the Snap Store for testing</p>
            </div>

            <div className={styles.workflowItemOneThrid}>
              <img className={styles.workflowImage} src='https://assets.ubuntu.com/v1/347628e8-workflow-icon06a.svg' />
              <p>When ready, you can promote the update to beta or stable channels</p>
            </div>

          </div>

          <div className={containerStyles.wrapper}>
            <Anchor  href="/auth/authenticate">Get started now</Anchor>
          </div>
        </section>

        <section className={styles.section}>
          <div className={ `${styles.row} ${containerStyles.wrapper}` }>

            <div className={styles.rowItemTwoThirds}>
              <p className={styles.snaps}>Snaps are secure, sandboxed, containerised applications, packaged with their dependencies for predictable behavior. With the Snap Store, people can safely install apps from any vendor on mission-critical devices and PCs.</p>
              <Anchor href="https://snapcraft.io">More about snaps</Anchor>
            </div>

            <div className={styles.rowItemOneThird}>
              <img src='https://assets.ubuntu.com/v1/cbd43363-snap-icon-default.svg' width='150' height='150'/></div>
          </div>
        </section>

        {/* TODO testimonials */}
      </div>
    );
  }

}

Landing.propTypes = {
  children: PropTypes.node,
  auth: PropTypes.object
};

function mapStateToProps(state) {
  const {
    auth
  } = state;

  return {
    auth
  };
}

export default connect(mapStateToProps)(Landing);
