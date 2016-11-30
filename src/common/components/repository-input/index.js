import 'isomorphic-fetch';

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import {
  updateInputValue,
  verifyGitHubRepository
} from '../../actions/repository-input';

export class RepositoryInput extends Component {
  constructor(props) {
    super(props);
  }

  getStatusMessage() {
    const input = this.props.repositoryInput;
    let message;

    if (input.repository && input.isFetching) {
      message = `Verifying ${input.repository} on GitHub...`;
    } else if (input.success && input.repositoryUrl) {
      message = `Repository ${input.repository} contains snapcraft project and can be built.`;
    } else if (input.error) {
      if (input.repository) {
        message = `Repository ${input.repository} is doesn't exist, is not public or doesn't contain snapcraft.yaml file.`;
      } else {
        message = 'Repository URL or name is invalid.';
      }
    }

    return message;
  }

  render() {
    return (
      <form onSubmit={this.onSubmit.bind(this)}>
        <label>Repository URL:</label>
        <input type='text' value={this.props.repositoryInput.inputValue} onChange={this.onInputChange.bind(this)} />
        <button type='submit'>Parse</button>
        <div>
          {this.getStatusMessage()}
        </div>
      </form>
    );
  }

  onInputChange(event) {
    this.props.dispatch(updateInputValue(event.target.value));
  }

  onSubmit(event) {
    this.props.dispatch(verifyGitHubRepository(this.props.repositoryInput.inputValue));
    event.preventDefault();
  }
}

RepositoryInput.propTypes = {
  repositoryInput: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
};

function mapStateToProps(state) {
  const {
    repositoryInput
  } = state;

  return {
    repositoryInput
  };
}

export default connect(mapStateToProps)(RepositoryInput);
