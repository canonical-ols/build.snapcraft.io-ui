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

    if (!input.repository) {
      message = 'Invalid repository URL.';
    } else if (input.repository && input.isFetching) {
      message = `Verifying ${input.repository} on GitHub...`;
    } else if (input.success && input.repositoryUrl) {
      message = `Repository ${input.repository} is valid.`;
    } else if (input.errors) {
      message = `Repository ${input.repository} is invalid.`;
    }

    return message;
  }

  render() {
    return (
      <div>
        <label>Repository URL:</label>
        <input type='text' value={this.props.repositoryInput.inputValue} onChange={this.onInputChange.bind(this)} />
        <button onClick={this.onButtonClick.bind(this)}>Parse</button>
        <div>
          {this.getStatusMessage()}
        </div>
      </div>
    );
  }

  onInputChange(event) {
    this.props.dispatch(updateInputValue(event.target.value));
  }

  onButtonClick() {
    this.props.dispatch(verifyGitHubRepository(this.props.repositoryInput.inputValue));
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
