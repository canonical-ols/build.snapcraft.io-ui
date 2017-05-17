import React from 'react';
import expect from 'expect';
import { shallow } from 'enzyme';
import sinon from 'sinon';

import { RepositoriesHomeRaw as RepositoriesHome } from '../../../../../../src/common/components/repositories-home';

let clock;

describe('The RepositoriesHome component', () => {
  let props;

  before(() => {
    clock = sinon.useFakeTimers();
  });

  after(() => {
    clock.restore();
  });

  context('when user just signed in', () => {
    let wrapper;

    beforeEach(() => {
      props = {
        hasJustSignedIn: true,
        auth: {
          authenticated: true
        },
        user: {},
        entities: {
          snaps: {}
        },
        snaps: {
          isFetching: true
        },
        snapBuilds: {},
        fetchBuilds: () => {},
        updateSnaps: () => {},
        router: {
          replace: expect.createSpy()
        }
      };

      wrapper = shallow(<RepositoriesHome { ...props } />);
    });

    it('should render spinner', () => {
      expect(wrapper.find('Spinner').length).toBe(1);
    });

    context('and component recieves props', () => {
      beforeEach(() => {
        wrapper.instance().componentDidMount();

        props = {
          ...props,
          snaps: {
            ...props.snaps,
            isFetching: false,
            success: true,
            snaps: [],
            ids: []
          }
        };
        wrapper.instance().componentWillReceiveProps(props);
      });

      afterEach(() => {
        wrapper.instance().componentWillUnmount();
      });

      it('should redirect to select repositories', () => {
        expect(props.router.replace).toHaveBeenCalledWith('/select-repositories');
      });
    });
  });

  context('when user has no snaps', () => {
    let wrapper;

    beforeEach(() => {
      props = {
        auth: {
          authenticated: true
        },
        user: {},
        entities: {
          snaps: {}
        },
        snaps: {
          isFetching: true
        },
        snapBuilds: {},
        fetchBuilds: () => {},
        updateSnaps: () => {},
        router: {}
      };

      wrapper = shallow(<RepositoriesHome { ...props } />);
    });

    xit('should render "No repos" message', () => {
      expect(wrapper.find('Spinner').length).toBe(1);
    });

  });

  context('when user is logged in', () => {
    let wrapper;

    beforeEach(() => {
      props = {
        auth: {
          authenticated: true
        },
        user: {},
        entities: {
          snaps: {}
        },
        snaps: {},
        snapBuilds: {},
        updateSnaps: expect.createSpy(),
        router: {}
      };

      wrapper = shallow(<RepositoriesHome { ...props } />);
    });

    context('and component mounts', () => {
      beforeEach(() => {
        wrapper.instance().componentDidMount();
      });

      afterEach(() => {
        wrapper.instance().componentWillUnmount();
      });

      it('should call updateSnaps callback immediately', () => {
        expect(props.updateSnaps).toHaveBeenCalled();
      });

      context('and after fifteen seconds', () => {
        beforeEach(() => {
          props.updateSnaps.reset();
          clock.tick(15000);
        });

        it('should dispatch updateSnaps callback again', () => {
          expect(props.updateSnaps).toHaveBeenCalled();
        });
      });
    });

    context('and component mounts, then unmounts', () => {
      beforeEach(() => {
        wrapper.instance().componentDidMount();
        clock.tick(60000);
        wrapper.instance().componentWillUnmount();
        props.updateSnaps.reset();
      });

      it('should not updateSnaps callback again', () => {
        clock.tick(60000);
        expect(props.updateSnaps).toNotHaveBeenCalled();
      });
    });
  });
});
