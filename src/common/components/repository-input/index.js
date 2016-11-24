import React, { Component } from 'react';

import parseGitHubUrl from 'parse-github-url';

export class RepositoryInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      message: '',
      repository: null,
      repositoryInput: ''
    };
  }

  render() {
    return (
      <div>
        <label>Repository URL:</label>
        <input type='text' value={this.state.repositoryInput} onChange={this.onInputChange.bind(this)} />
        <button onClick={this.onButtonClick.bind(this)}>Parse</button>
        <div>
          {this.state.message}
        </div>
      </div>
    );
  }

  onInputChange(event) {
    this.setState({
      repositoryInput: event.target.value
    });
  }

  onButtonClick() {
    const gitHubRepo = parseGitHubUrl(this.state.repositoryInput);
    const repo = gitHubRepo ? gitHubRepo.repo : null;
    let message;

    if (repo) {
      let repoUrl = `https://github.com/${repo}.git`;
      message = <span>Repository: {repo}, URL: <a href={repoUrl}>{repoUrl}</a></span>;
    } else {
      message = 'Invalid repository URL';
    }

    this.setState({
      message: message
    });
  }
}

export default RepositoryInput;
