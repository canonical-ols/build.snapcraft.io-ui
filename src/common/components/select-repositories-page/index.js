import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { fetchUserSnaps } from '../../actions/snaps';
import { fetchBuilds } from '../../actions/snap-builds';
import { fetchUserRepositories } from '../../actions/repositories';
import SelectRepositoryList from '../select-repository-list';
import { HeadingThree } from '../vanilla/heading';
import FirstTimeHeading from '../first-time-heading';
import { CardHighlighted } from '../vanilla/card';
import Popover from '../popover';
import Button from '../vanilla/button';

import styles from './select-repositories-page.css';

class SelectRepositoriesPage extends Component {
  constructor() {
    super();

    this.state = {
      showPopover: false,
      popoverOffsetLeft: 0,
      popoverOffsetTop: 0,
      subscribeEmail: ''
    };
  }

  componentDidMount() {
    const { authenticated } = this.props.auth;
    const owner = this.props.user.login;

    if (authenticated) {
      this.props.dispatch(fetchUserRepositories());
      this.props.dispatch(fetchUserSnaps(owner));
    }

    this.fetchData(this.props);
  }

  fetchData(props) {
    const { snaps } = props;

    if (snaps.success) {
      snaps.snaps.forEach((snap) => {
        this.props.dispatch(fetchBuilds(snap.git_repository_url, snap.self_link));
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.snaps.success !== nextProps.snaps.success) {
      this.fetchData(nextProps);
    }
  }

  onHelpClick(event) {
    const { target } = event;

    this.setState({
      showPopover: !this.state.showPopover,
      popoverOffsetLeft: target.offsetLeft + (target.offsetWidth / 2),
      popoverOffsetTop: target.offsetTop + target.offsetHeight
    });
  }

  onEmailChange(event) {
    const { target } = event;

    this.setState({
      subscribeEmail: target.value
    });
  }

  onSubscribeSubmit(event) {
    event.preventDefault();

    // TODO: bartaz: do real submit
    window.console.log('SUBMIT', this.state.subscribeEmail);
  }

  render() {
    const { snaps, snapBuilds } = this.props;
    return (
      <div>
        <FirstTimeHeading snaps={snaps} snapBuilds={snapBuilds} />
        <CardHighlighted>
          <HeadingThree className={ styles.heading }>
            Choose repos to add
          </HeadingThree>
          <div className={ styles.info }>
            <p>Organization and private repos not shown yet. (<a onClick={this.onHelpClick.bind(this)}>Why?</a>)</p>
            { this.state.showPopover &&
              <Popover left={this.state.popoverOffsetLeft} top={this.state.popoverOffsetTop}>
                <p>We’re working hard on making these buildable. If you like, we can e-mail you when we’re ready.</p>
                <form onSubmit={this.onSubscribeSubmit.bind(this)}>
                  <label className={styles.subscribeEmailLabel} htmlFor="subscribe_email">E-mail address:</label>
                  <input
                    id="subscribe_email"
                    className={styles.subscribeEmailInput}
                    type="email"
                    onChange={this.onEmailChange.bind(this)}
                    value={this.state.subscribeEmail}
                  />
                  <Button type="submit" appearance='neutral' flavour='ensmallened'>Keep me posted</Button>
                </form>
              </Popover>
            }
          </div>
          <SelectRepositoryList/>
        </CardHighlighted>
      </div>
    );
  }
}

SelectRepositoriesPage.propTypes = {
  auth: PropTypes.object.isRequired,
  user: PropTypes.object,
  snaps: PropTypes.object.isRequired,
  snapBuilds: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
};

function mapStateToProps(state) {
  const {
    auth,
    user,
    snaps,
    snapBuilds
  } = state;

  return {
    auth,
    user,
    snaps,
    snapBuilds
  };
}

export default connect(mapStateToProps)(SelectRepositoriesPage);
