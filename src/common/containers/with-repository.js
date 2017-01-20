import React, { Component, PropTypes } from 'react';

import { setGitHubRepository } from '../actions/repository-input';

function withRepository(WrappedComponent) {

  class WithRepository extends Component {

    componentDidMount() {
      if (!this.props.repository && this.props.fullName) {
        this.props.dispatch(setGitHubRepository(this.props.fullName));
      }
    }

    componentWillReceiveProps(nextProps) {
      if (this.props.fullName !== nextProps.fullName) {
        this.props.dispatch(setGitHubRepository(nextProps.fullName));
      }
    }

    componentWillUnmount() {

    }

    render() {
      const { fullName, ...passThroughProps } = this.props;
      fullName; // just to 'use' this variable

      return (this.props.repository
        ? <WrappedComponent {...passThroughProps} />
        : null
      );
    }
  }
  WithRepository.displayName = `WithRepository(${getDisplayName(WrappedComponent)})`;

  WithRepository.propTypes = {
    fullName: PropTypes.string.isRequired,
    repository: PropTypes.object,
    dispatch: PropTypes.func.isRequired
  };

  return WithRepository;
}

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export default withRepository;
