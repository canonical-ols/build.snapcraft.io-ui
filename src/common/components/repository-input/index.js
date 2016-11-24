import 'isomorphic-fetch';

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
      let apiUrl = `https://api.github.com/repos/${repo}`;

      message = <span>Repository: {repo}, URL: <a href={repoUrl}>{repoUrl}</a></span>;

      let self = this;
      fetch(apiUrl)
        .then((response) => {
          if (response.status >= 200 && response.status < 300) {
            return response.json();
          } else {
            const error = new Error(response.statusText);
            error.response = response;
            throw error;
          }
        })
        .then(() => {
          self.setState({
            message: <span>{this.state.message}  [exists on GitHub]</span>
          });
        })
        .catch((errors) => {
          self.setState({
            message: `Repository ${repo} doesn't exist (${errors})`
          });
        });

    } else {
      message = 'Invalid repository URL';
    }

    this.setState({
      message: message
    });
  }
}

export default RepositoryInput;
