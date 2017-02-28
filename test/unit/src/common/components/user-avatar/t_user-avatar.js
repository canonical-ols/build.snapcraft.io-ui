import React from 'react';
import expect from 'expect';
import { shallow } from 'enzyme';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import UserAvatar from '../../../../../../src/common/components/user-avatar';
import { HeadingOne, HeadingThree } from '../../../../../../src/common/components/vanilla/heading';

const middlewares = [ thunk ];
const mockStore = configureMockStore(middlewares);

describe('<UserAvatar />', function() {
  let element;
  let store;
  let auth;
  let user;

  beforeEach(() => {
    store = mockStore({
      auth,
      user
    });

    // shallow render container component with the store
    element = shallow(<UserAvatar store={store} />)
    // find react component by class name and shallow render it
      .find('UserAvatar').shallow();
  });

  context('when user is not authenticated', () => {

    before(() => {
      auth = {
        authenticated: false
      };

      user = null;
    });

    it('should not render', () => {
      expect(element.type()).toBe(null);
    });
  });

  context('when user is authenticated', () => {
    before(() => {
      auth = {
        authenticated: true
      };

      user = {
        name: 'Joe Doe',
        login: 'jdoe',
        avatar_url: 'http://example.com/nyancat.gif'
      };

    });

    it('should render avatar image', () => {
      expect(element.containsMatchingElement(<img src={ user.avatar_url } />)).toBe(true);
    });

    it('should render big user name', () => {
      expect(element.containsMatchingElement(<HeadingOne>{ user.name }</HeadingOne>)).toBe(true);
    });

    it('should render small user login', () => {
      expect(element.containsMatchingElement(<HeadingThree>{ user.login }</HeadingThree>)).toBe(true);
    });

    context('when user has no name', () => {

      before(() => {
        user = {
          login: 'jdoe'
        };
      });

      it('should render big user login', () => {
        expect(element.containsMatchingElement(<HeadingOne>{ user.login }</HeadingOne>)).toBe(true);
      });

      it('should not render small user login', () => {
        expect(element.find(HeadingThree).length).toBe(0);
      });
    });
  });

});
