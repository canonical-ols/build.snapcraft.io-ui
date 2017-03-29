import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { fetchUserSnaps } from '../../actions/snaps';
import { fetchBuilds } from '../../actions/snap-builds';
import { fetchUserRepositories } from '../../actions/repositories';
import SelectRepositoryList from '../select-repository-list';
import { HeadingThree } from '../vanilla/heading';
import FirstTimeHeading from '../first-time-heading';
import { CardHighlighted } from '../vanilla/card';
import Tooltip from '../tooltip';
import Button from '../vanilla/button';

import styles from './select-repositories-page.css';

class SelectRepositoriesPage extends Component {
  constructor() {
    super();

    this.state = {
      showTooltip: false,
      tooltipOffsetLeft: 0,
      tooltipOffsetTop: 0,
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
      showTooltip: !this.state.showTooltip,
      tooltipOffsetLeft: target.offsetLeft + (target.offsetWidth / 2),
      tooltipOffsetTop: target.offsetTop + target.offsetHeight
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
            { this.state.showTooltip &&
              <Tooltip left={this.state.tooltipOffsetLeft} top={this.state.tooltipOffsetTop}>
                <p>We’re working hard on making these buildable. If you like, we can e-mail you when we’re ready.</p>
                <form onSubmit={this.onSubscribeSubmit.bind(this)}>
                  {/* TODO: add label, remove placeholder */}
                  <input
                    className={styles.tooltipInput}
                    type="email"
                    placeholder="you@email.com"
                    onChange={this.onEmailChange.bind(this)}
                    value={this.state.subscribeEmail}
                  />
                  <Button type="submit" appearance='neutral' flavour='ensmallened'>Keep me posted</Button>
                </form>
              </Tooltip>
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
