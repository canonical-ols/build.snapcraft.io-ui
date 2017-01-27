import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import conf from '../../helpers/config';
import { createSnap } from '../../actions/repository-input';
import { Message } from '../forms';
import RepositoryRow from '../repository-row';
import Spinner from '../spinner';

// loading container styles not to duplicate .spinner class
import styles from '../../containers/container.css';

class RepositoriesList extends Component {


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

  renderRepository(repo) {
    const isLoading = this.props.repositoryInput.isFetching;

    return (
      <RepositoryRow
        key={`repo_${repo.fullName}`}
        repository={repo}
        buttonLabel={ isLoading ? 'Creating...' : 'Create' }
        buttonDisabled={ isLoading }
        onButtonClick={this.onButtonClick.bind(this, repo)}
      />
    );
  }

  onButtonClick(repository) {
    if (repository) {
      this.props.dispatch(createSnap(repository.url));
    }
  }

  render() {
    const { authenticated } = this.props.auth;

    // TODO: createSnap errors are currently kept in repositoryInput reducer
    const input = this.props.repositoryInput;
    const isValid = !authenticated || !input.error;
    const isLoading = this.props.repositories.isFetching;

    return (
      <div>
        { isLoading &&
          <div className={styles.spinner}><Spinner /></div>
        }
        { !isValid &&
          <Message status='error'>
            {this.getErrorMessage()}
          </Message>
        }
        { this.props.repositories.success &&
          this.props.repositories.repos.map(this.renderRepository.bind(this))
        }
      </div>
    );
  }
}

RepositoriesList.propTypes = {
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

export default connect(mapStateToProps)(RepositoriesList);
