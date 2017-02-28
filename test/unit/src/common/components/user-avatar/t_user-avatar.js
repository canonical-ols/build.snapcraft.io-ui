import React from 'react';
import expect from 'expect';
import { shallow } from 'enzyme';

import { UserAvatar } from '../../../../../../src/common/components/user-avatar';
import { HeadingOne, HeadingThree } from '../../../../../../src/common/components/vanilla/heading';

describe('<UserAvatar />', function() {
  let element;

  context('when user is not authenticated', () => {
    const auth = {
      authenticated: false
    };

    const user = null;

    beforeEach(() => {
      element = shallow(<UserAvatar auth={auth} user={user} />);
    });

    it('should not render', () => {
      expect(element.type()).toBe(null);
    });
  });

  context('when user is authenticated', () => {
    const auth = {
      authenticated: true
    };

    const user = {
      name: 'Joe Doe',
      login: 'jdoe',
      avatar_url: 'http://example.com/nyancat.gif'
    };

    beforeEach(() => {
      element = shallow(<UserAvatar auth={auth} user={user} />);
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
      const user = {
        login: 'jdoe'
      };

      beforeEach(() => {
        element = shallow(<UserAvatar auth={auth} user={user} />);
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
