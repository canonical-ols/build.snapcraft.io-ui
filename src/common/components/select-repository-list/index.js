import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import SelectRepositoryRow from '../select-repository-row';
import Spinner from '../spinner';
import Button, { LinkButton } from '../vanilla/button';
import {
  addRepos,
  resetRepository,
  toggleRepositorySelection,
} from '../../actions/repository';
import {
  getEnabledRepositories,
  getSelectedRepositories,
  getReposToAdd,
  hasFailedRepositories,
  isAddingSnaps
} from '../../selectors/index.js';
import styles from './styles.css';

import PrivateReposInfo from '../private-repos-info/private-repos-info';

// loading container styles not to duplicate .spinner class
import { spinner as spinnerStyles } from '../../containers/container.css';

export class SelectRepositoryListComponent extends Component {

  constructor() {
    super();

    this.state = {
      showMissingReposInfo: false,
      addTriggered: false,
    };
  }

  componentDidMount() {
    this.props.selectedRepositories && this.props.selectedRepositories.map(id => {
      this.props.dispatch(resetRepository(id));
    });
  }

  componentWillUnmount() {
    // unbind document click event
    if (typeof document !== 'undefined') {
      document.removeEventListener('click', this.onBoundDocumentClick);
    }
  }

  onHelpClick(event) {
    // prevent help click from triggering document click
    event.nativeEvent.stopImmediatePropagation();

    this.setState({
      showMissingReposInfo: !this.state.showMissingReposInfo
    });
  }

  onMissingInfoClick(event) {
    // prevent info from closing when it's clicked
    event.nativeEvent.stopImmediatePropagation();
  }

  onRefreshClick() {
    this.setState({
      showMissingReposInfo: false
    });
    this.props.onRefresh();
  }

  renderRepository(id) {
    const repository = this.props.entities.repos[id];
    const { fullName } = repository;

    const isRepoEnabled = !!this.props.enabledRepositories[id];

    return (
      <SelectRepositoryRow
        key={ `repo_${fullName}` }
        repository={ repository }
        onChange={ this.onSelectRepository.bind(this, id) }
        errorMsg={ repository.error && repository.error.message }
        isRepoEnabled={ isRepoEnabled }
      />
    );
  }

  onSelectRepository(id) {
    this.props.dispatch(toggleRepositorySelection(id));
  }

  handleAddRepositories() {
    const { reposToAdd, user } = this.props;

    if (reposToAdd.length) {
      this.setState({
        addTriggered: true,
      });
      this.props.dispatch(addRepos(reposToAdd, user.login));
    }
  }

  renderRepoList() {
    const { ids, error, isFetching, isDelayed } = this.props.repositories;

    if (isFetching && ids.length === 0) {
      return (
        <div className={ styles.spinnerWrapper }>
          { isDelayed &&
            <div className={ spinnerStyles }><Spinner /></div>
          }
        </div>
      );
    }

    let renderedRepos = null;

    if (!error) {
      renderedRepos = ids.map((id) => this.renderRepository(id));
    } else {
      // TODO show error message and keep old repo list
    }

    return renderedRepos;
  }

  renderRepoAmount() {
    const { ids, isFetching } = this.props.repositories;
    const { selectedRepositories } = this.props;

    if (isFetching && ids.length === 0) {
      return (
        <span>Calculating your total repositories&hellip;</span>
      );
    }

    return (
      <div>
        <strong>
          { selectedRepositories.length } selected out of { ids.length } Total repositories
        </strong>
      </div>
    );
  }

  render() {
    const { user, selectedRepositories, isAddingSnaps, isUpdatingSnaps } = this.props;

    const buttonSpinner = this.state.addTriggered && (isAddingSnaps || isUpdatingSnaps);

    return (
      <div>
        <div className={ styles.repoList }>
          { this.state.showMissingReposInfo
            ? (
              <PrivateReposInfo
                user={user}
                onRefreshClick={this.onRefreshClick.bind(this)}
                onClick={this.onMissingInfoClick.bind(this)}
              />
            )
            : this.renderRepoList()
          }
        </div>
        <div className={ styles.footer }>
          { this.state.showMissingReposInfo &&
            <div className={ styles.arrow } />
          }
          <div className={ styles.summary }>
            { this.renderRepoAmount() }
            <div>
              {'\u00A0'}
              (<Button appearance={ 'link' } onClick={this.onHelpClick.bind(this)}>
                { this.state.showMissingReposInfo ? 'Return to repos list' : 'Anything missing?' }
              </Button>)
            </div>
          </div>
          <div>
            <LinkButton appearance="base" to={`/user/${user.login}`}>
              Cancel
            </LinkButton>
            {' '}
            <Button
              appearance={ 'positive' }
              disabled={ !selectedRepositories.length || buttonSpinner }
              onClick={ this.handleAddRepositories.bind(this) }
              isSpinner={buttonSpinner}
            >
              Add
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

SelectRepositoryListComponent.propTypes = {
  dispatch: PropTypes.func.isRequired,
  entities: PropTypes.object.isRequired,
  onSelectRepository: PropTypes.func,
  repositories: PropTypes.object,
  user: PropTypes.object,
  repositoriesStatus: PropTypes.object,
  router: PropTypes.object.isRequired,
  selectedRepositories: PropTypes.array,
  reposToAdd: PropTypes.array,
  enabledRepositories: PropTypes.object,
  hasFailedRepositories: PropTypes.bool,
  isUpdatingSnaps: PropTypes.bool,
  isAddingSnaps: PropTypes.bool,
  onRefresh: PropTypes.func
};

function mapStateToProps(state, ownProps) {
  const {
    user,
    entities,
    repositories,
  } = state;

  return {
    onRefresh: ownProps.onRefresh,
    user,
    entities,
    repositories, // ?repository-pagination
    isUpdatingSnaps: state.snaps.isFetching,
    isAddingSnaps: isAddingSnaps(state),
    selectedRepositories: getSelectedRepositories(state),
    reposToAdd: getReposToAdd(state),
    enabledRepositories: getEnabledRepositories(state),
    hasFailedRepositories: hasFailedRepositories(state)
  };
}

export default connect(mapStateToProps)(withRouter(SelectRepositoryListComponent));
