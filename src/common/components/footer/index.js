import React, { Component } from 'react';

import style from '../../style/vanilla/css/footer.css';
import gridStyle from '../../style/vanilla/css/grid.css';

export default class Footer extends Component {

  backToTop(event) {
    event.preventDefault();
    document.body.scrollTo(0,0);
  }

  render() {
    return (
      <footer className={`${style['p-footer']} ${style['p-strip--light']} ${style['p-sticky-footer']}`}>
        <div className={ gridStyle['row'] }>
          <div className={ gridStyle['col-8'] }>
            <nav className={ style['p-footer__nav'] }>
              <ul className={ style['p-footer__links'] }>
                <li className={ style['p-footer__item'] }>
                  <a
                    className={ style['p-footer__link'] }
                    href="#content"
                    onClick={this.backToTop.bind(this)}
                  >
                    Back to top<i className={ style['p-icon--top'] }></i>
                  </a>
                </li>
              </ul>
            </nav>
            <p>&copy; 2019 Canonical Ltd. <br/> Ubuntu and Canonical are registered trademarks of Canonical Ltd.<br />
            Powered by <a href="https://www.ubuntu.com/kubernetes">the Charmed Distribution of Kubernetes</a></p>
            <p>
              <a
                className={ style['p-link--external'] }
                href="https://bugs.launchpad.net/snapd"
              >Join the forum</a>, contribute to or report problems with,
              {' '}
              <a
                className={ style['p-link--external'] }
                href="https://bugs.launchpad.net/snapd"
              >snapd</a>,
              {' '}
              <a
                className={ style['p-link--external'] }
                href="https://bugs.launchpad.net/snapcraft"
              >Snapcraft</a>,
              {' '}
              or
              {' '}
              <a
                className={ style['p-link--external'] }
                href="https://github.com/canonical-websites/build.snapcraft.io/issues"
              >this site</a>.
            </p>
            <div className={ gridStyle['col-12'] }>
              <ul className={ style['p-inline-list--middot','u-no-margin--bottom'] }>
                <li className={ style['p-inline-list__item'] }>
                  <a href="https://www.ubuntu.com/legal" className={ style['p-link--soft'] } accesskey="6">Legal information</a>
                </li>
                <li className={ style['p-inline-list__item'] }>
                  <a href="https://www.ubuntu.com/legal/data-privacy" className={ style['p-link--soft'] } accesskey="7">Data privacy</a>
                </li>
                <li className={ style['p-inline-list__item'] }>
                  <a href="https://status.snapcraft.io" className={ style['p-link--soft'] } accesskey="8">Service status</a>
                </li>
                <li className={ style['p-inline-list__item'] }>
                  <a href="https://dashboard.snapcraft.io" className={ style['p-link--soft'] } accesskey="9">Other functions</a>
                </li>
                <li className={ style['p-inline-list__item'] }>
                  <a href="https://boards.greenhouse.io/canonical/jobs/1161820" className={ style['p-link--soft','p-link--external'] } accesskey="7">We're hiring!</a>
                </li>
              </ul>
            </div>
          </div>
          <div className={ gridStyle['col-4'] }>
            <ul className={ style['p-inline-list--compact'] }>
              <li className={ style['p-inline-list__item'] }>
                <a href="https://twitter.com/snapcraftio" className={ style['p-social-icon--twitter'] }>Share on Twitter</a>
              </li>
              <li className={ style['p-inline-list__item'] }>
                <a href="https://www.facebook.com/snapcraftio" className={ style['p-social-icon--facebook'] }>Share on Facebook</a>
              </li>
              <li className={ style['p-inline-list__item'] }>
                <a href="https://www.youtube.com/snapcraftio" className={ style['p-social-icon--youtube'] }>Share on YouTube</a>
              </li>
            </ul>
          </div>
        </div>
      </footer>

    );
  }
}
