import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { createSnap } from '../../actions/repository-input';
import { fetchUserRepositories } from '../../actions/repositories';

import conf from '../../helpers/config';

import Step from '../step';
import { Message } from '../forms';
import { Anchor } from '../button';

import RepositoryRow from '../repository-row';

class RepositoriesHome extends Component {
  componentDidMount() {
    const { authenticated } = this.props.auth;

    if (authenticated) {
      this.props.dispatch(fetchUserRepositories());
    }
  }

  getErrorMessage() {
    const input = this.props.repositoryInput;

    if (input.error) {
      const payload = input.error.json.payload;
      if (payload.code === 'snap-name-not-registered') {
        const snapName = payload.snap_name;
        const devportalUrl = conf.get('STORE_DEVPORTAL_URL');
        const registerNameUrl = `${devportalUrl}/click-apps/register-name/` +
                                `?name=${encodeURIComponent(snapName)}`;
        return (
          <span>
            The name provided in the snapcraft.yaml file ({snapName}) is not
            registered in the store.
            Please <a href={registerNameUrl}>register it</a> before trying
            again.
          </span>
        );
      } else {
        return input.error.message;
      }
    }

    return 'Unexpected error. Please make sure you are entering a valid GitHub repository and try again.';
  }

  render() {
    return (
      <div>
        <h2>Welcome</h2>
        <p>To get started building snaps, sign in with GitHub and tell us about your repository.</p>
        <ol>
          { this.step1.call(this) }
          { this.step2.call(this) }
        </ol>
      </div>
    );
  }

  step1() {
    const { authenticated } = this.props.auth;

    return (
      <Step number="1" complete={ authenticated }>
        <Anchor href="/auth/authenticate">Log in with GitHub</Anchor>
      </Step>
    );
  }

  renderRepository(repo) {
    return <RepositoryRow key={`repo_${repo.fullName}`} repository={repo} onClick={this.onButtonClick.bind(this, repo)} />;
  }

  onButtonClick(repository) {
    if (repository) {
      this.props.dispatch(createSnap(repository.url));
    }
  }

  step2() {
    const { authenticated } = this.props.auth;

    // TODO: createSnap errors are currently kept in repositoryInput reducer
    const input = this.props.repositoryInput;
    const isValid = !authenticated || !input.error;

    return (
      <Step number="2">
        Choose one of your repositories
        { !isValid &&
          <Message status='error'>
            {this.getErrorMessage()}
          </Message>
        }
        <div>
          { this.props.repositories.success &&
            this.props.repositories.repos.map(this.renderRepository.bind(this))
          }
        </div>
      </Step>
    );
  }
}

RepositoriesHome.propTypes = {
  repositories: PropTypes.object,
  repositoryInput: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
};

function mapStateToProps(state) {
  const {
    repositories,
    repositoryInput,
    auth
  } = state;

  return {
    auth,
    repositories,
    repositoryInput
  };
}

export default connect(mapStateToProps)(RepositoriesHome);
