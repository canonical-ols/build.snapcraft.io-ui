import expect, { spyOn } from 'expect';
import React from 'react';
import { shallow } from 'enzyme';

import {
  SelectRepositoryListComponent
} from '../../../../../../src/common/components/select-repository-list';
import SelectRepositoryRow from '../../../../../../src/common/components/select-repository-row';
import {
  addRepos,
  resetRepository,
  toggleRepositorySelection,
} from '../../../../../../src/common/actions/repository';
import { LinkButton } from '../../../../../../src/common/components/vanilla/button';
import Spinner from '../../../../../../src/common/components/spinner';

describe('<SelectRepositoryListComponent /> instance', function() {
  let props;

  beforeEach(function() {
    props = {
      router: {},
      dispatch: () => {},
      user: {
        name: 'Joe Doe',
        login: 'jdoe'
      },
      entities: {
        snaps: {},
        repos: {
          1001: {
            owner: 1,
            fullName: 'canonical/foo',
            url: 'https://github.com/canonical/foo'
          },
          1002: {
            owner: 1,
            fullName: 'canonical/bar',
            url: 'https://github.com/canonical/bar'
          },
          1003: {
            owner: 1,
            fullName: 'canonical/baz',
            url: 'https://github.com/canonical/baz'
          }
        },
        owners: {
          1: {
            name: 'Canonical Ltd.'
          }
        }
      },
      repositories: {
        isFetching: false,
        ids: [1001, 1002, 1003],
        searchTerm: ''
      },
      snaps: {
        success: true,
        snaps: []
      },
      enabledRepositories: { // stub the selector
        1001: {}
      },
      filteredRepos: [1001, 1002, 1003],
      selectedRepositories: [], // stub the selector
      reposToAdd: [] // stub the selector
    };
  });

  context('initial state, before selecting any repositories', function() {
    let wrapper;
    let spy;

    beforeEach(function() {
      spy = spyOn(props, 'dispatch');
      wrapper = shallow(<SelectRepositoryListComponent { ...props } />);
    });

    afterEach(function() {
      spy.restore();
    });

    it('should hide LinkButton when has no repositories', function() {
      expect(wrapper.find(LinkButton).length).toBe(1);
      wrapper.setProps({ repositories: Object.assign({}, props.repositories, { ids: [] }) });
      expect(wrapper.find(Spinner).length).toBe(0);
    });

    it('should render disabled Add button', function() {
      expect(wrapper.find('Button').last().prop('disabled')).toBe(true);
    });

    it('should show message about 3 total repos', function() {
      expect(wrapper.html()).toInclude('3 repos');
    });

    it('should show not message about 0 selected repos', function() {
      expect(wrapper.html()).toNotInclude('0 selected,');
    });

    it('should render same number of rows as repos in state', function() {
      expect(wrapper.find(SelectRepositoryRow).length).toBe(props.repositories.ids.length);
    });

    it('should contain same number of enabled rows as enabledRepositores selector', function() {
      expect(wrapper.find({ isRepoEnabled: true }).length)
        .toBe(Object.keys(props.enabledRepositories).length);
    });

    it('should not try to reset selected state on selected repos on mount', function() {
      wrapper.instance().componentDidMount();
      expect(spy).toNotHaveBeenCalled();
    });
  });

  context('selecting repositories', function() {
    let wrapper;
    let spy;

    beforeEach(function() {
      spy = spyOn(props, 'dispatch');
      wrapper = shallow(<SelectRepositoryListComponent { ...props } />);
    });

    afterEach(function() {
      spy.restore();
    });

    it('should dispatch toggleRepositorySelection from onSelectRepository change event', function() {
      const repoId = 1002;

      wrapper
        .find(SelectRepositoryRow)
        .find({ repository: props.entities.repos[repoId] })
        .simulate('change');

      expect(spy).toHaveBeenCalledWith(toggleRepositorySelection(repoId));
    });
  });

  context('selected repositories', function() {
    let wrapper;
    let spy;
    let repoId = 1002;
    let testProps;

    beforeEach(function() {
      testProps = Object.assign({}, props, { selectedRepositories: [repoId] });

      spy = spyOn(testProps, 'dispatch');
      wrapper = shallow(<SelectRepositoryListComponent { ...testProps } />);
    });

    afterEach(function() {
      spy.restore();
    });

    it('should dispatch reset action on all selected repos on mount', function() {
      wrapper.instance().componentDidMount();
      expect(spy).toHaveBeenCalledWith(resetRepository(repoId));
    });

    it('should show message about 1 selected repos', function() {
      expect(wrapper.html()).toInclude('1 selected of');
    });
  });

  context('adding repositories', function() {
    let wrapper;
    let spy;
    let testProps;

    beforeEach(function() {
      testProps = Object.assign({}, props, { reposToAdd: ['foo'] });
      spy = spyOn(testProps, 'dispatch');
      wrapper = shallow(<SelectRepositoryListComponent { ...testProps } />);
    });

    afterEach(function() {
      spy.restore();
    });

    it('should dispatch selected repositories for building on add button click', function() {
      wrapper.find('Button').last().simulate('click');
      expect(spy).toHaveBeenCalledWith(addRepos(testProps.reposToAdd));
    });
  });

  context('searching repositories', function() {
    let wrapper;

    beforeEach(function() {
      wrapper = shallow(<SelectRepositoryListComponent { ...props } />);
    });

    it('should render same number of rows as repos in filtered repos', function() {
      expect(wrapper.find(SelectRepositoryRow).length).toBe(props.filteredRepos.length);
    });

    it('should render only one row as filtered repos has been changed', function() {
      wrapper.setProps(Object.assign({}, props, { filteredRepos: [1001] }));
      expect(wrapper.find(SelectRepositoryRow).length).toBe(1);
    });

    it('should render text 1 match in', function() {
      wrapper.setProps(Object.assign({}, props, { filteredRepos: [1001] }));
      expect(wrapper.html()).toNotInclude('1 match in');
    });
  });
});
