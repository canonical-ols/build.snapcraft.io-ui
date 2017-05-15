import React from 'react';
import expect from 'expect';
import { shallow } from 'enzyme';

import { CopyToClipboard } from '../../../../../../src/common/components/share';

describe('<CopyToClipboard />', function() {
  let wrapper;

  beforeEach(function() {
    wrapper = shallow(<CopyToClipboard copyme={'hello'} />);
    wrapper.setState({ isSupported: true });
  });

  it('should not render if clipboard API is unsupported', function() {
    wrapper.setState({ isSupported: false });
    expect(wrapper.type()).toBe(null);
  });

  it('should render if clipboard API is supported', function() {
    expect(wrapper.type()).toBe('span');
  });

  it('should render with data-clipboard-action attr', function() {
    expect(wrapper.is('[data-clipboard-action="copy"]')).toBe(true);
  });

  it('should render with data-clipboard-text attr', function() {
    const copyme = 'string to be copied';

    wrapper.setProps({ copyme });
    expect(wrapper.is(`[data-clipboard-text="${copyme}"]`)).toBe(true);
  });
});
