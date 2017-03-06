import React from 'react';
import expect from 'expect';
import { shallow } from 'enzyme';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import withRepository from '../../../../../src/common/containers/with-repository';

const middlewares = [ thunk ];
const mockStore = configureMockStore(middlewares);

// Dummy test component to wrap
const Dummy = () => <span>Dummy</span>;

import { SET_GITHUB_REPOSITORY } from '../../../../../src/common/actions/create-snap';

describe('WithRepository', () => {
  const PARAMS = {
    owner: 'anowner',
    name: 'aname'
  };
  const REPO = {
    fullName: 'anowner/aname'
  };

  let store;

  let wrapper;  // WithRepository rendered wrapper
  let instance; // WithRepository wrapper instance
  let wrapped;  // wrapped Dummy component

  const setupDummy = (repository = REPO, params = PARAMS) => {
    store = mockStore({ repository });

    const DummyWithRepo = withRepository(Dummy);

    // shallow render container component
    const dummyWithRepo = shallow(<DummyWithRepo store={store} params={params}/>);

    // get child components/instances from rendered component
    wrapper = dummyWithRepo.first();
    instance = wrapper.shallow().instance();
    wrapped = wrapper.dive();
  };

  beforeEach(() => {
    setupDummy();
  });

  it('should get repository from the store', () => {
    expect(wrapper.prop('repository')).toEqual(REPO);
  });

  it('should get fullName from URL params', () => {
    expect(wrapper.prop('fullName')).toEqual(`${PARAMS.owner}/${PARAMS.name}`);
  });

  context('when current repo is already in the store', () => {
    it('should render wrapped component', () => {
      expect(wrapped.is(Dummy)).toBe(true);
    });

    it('should pass repository to wrapped component', () => {
      expect(wrapped.prop('repository')).toBe(REPO);
    });

    it('should not dispatch action to set repo in store', () => {
      instance.componentDidMount();

      expect(store.getActions()).notToHaveActionOfType(SET_GITHUB_REPOSITORY);
    });
  });

  context('when repo is not in the store', () => {
    beforeEach(() => {
      setupDummy(null);
    });

    it('should not render wrapped component', () => {
      expect(wrapped.type()).toBe(null);
    });

    it('should dispatch action to set repo in store', () => {
      // manually calling componentDidMount to avoid full render
      instance.componentDidMount();

      expect(store.getActions()).toHaveActionOfType(SET_GITHUB_REPOSITORY);
    });
  });

  context('when repo in the store is different then in params', () => {
    beforeEach(() => {
      setupDummy({ fullName: 'and-now-for-something/completely-different' });
    });

    it('should not render wrapped component', () => {
      expect(wrapped.type()).toBe(null);
    });

    it('should dispatch action to set repo in store', () => {
      // manually calling componentDidMount to avoid full render
      instance.componentDidMount();

      expect(store.getActions()).toHaveActionOfType(SET_GITHUB_REPOSITORY);
    });
  });



});
