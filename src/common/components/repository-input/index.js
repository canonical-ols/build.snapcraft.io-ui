import 'isomorphic-fetch';

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import {
  setGitHubRepository,
  verifyGitHubRepository
} from '../../actions/repository-input';

import Button from '../button';
import { Form, InputField, Message } from '../forms';

export class RepositoryInput extends Component {
  constructor(props) {
    super(props);
  }

  getStatusMessage() {
    const input = this.props.repositoryInput;
    let message;

    if (input.inputValue.length > 2 && !input.repository) {
      message = '❌ Repository URL or name is invalid.';
    } else if (input.repository && input.isFetching) {
      message = `🔍 Verifying ${input.repository} on GitHub...`;
    } else if (input.success && input.repositoryUrl) {
      message = `✅ Repository ${input.repository} contains snapcraft project and can be built.`;
    } else if (input.error) {
      if (input.repository) {
        message = `❌ Repository ${input.repository} is doesn't exist, is not public or doesn't contain snapcraft.yaml file.`;
      }
    }

    return message;
  }

  render() {
    const isValid = !!this.props.repositoryInput.repository;

    return (
      <Form onSubmit={this.onSubmit.bind(this)}>

        <InputField
          label='Repository URL'
          placeholder='username/snap-example'
          value={this.props.repositoryInput.inputValue}
          onChange={this.onInputChange.bind(this)}
        />
        <Message
          status={isValid ? 'success' : 'error'}
          text={this.getStatusMessage()}
        />
        <Button type='submit' disabled={!isValid}>Verify</Button>
      </Form>
    );
  }

  onInputChange(event) {
    this.props.dispatch(setGitHubRepository(event.target.value));
  }

  onSubmit(event) {
    const { repository } = this.props.repositoryInput;

    if (repository) {
      this.props.dispatch(verifyGitHubRepository(repository));
    }
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
