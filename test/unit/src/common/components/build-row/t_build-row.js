import React from 'react';
import expect from 'expect';
import { shallow } from 'enzyme';
import { Link } from 'react-router';

import BuildRow from '../../../../../../src/common/components/build-row';
import { Row, Data } from '../../../../../../src/common/components/vanilla/table-interactive';
import { BUILD_TRIGGER_UNKNOWN, BUILD_TRIGGERED_BY_WEBHOOK } from '../../../../../../src/common/helpers/build_annotation';

describe('<BuildRow />', function() {
  const TEST_BUILD = {
    isRequest: false,
    buildId: '1234',
    buildLogUrl: 'http://example.com/12344567890_BUILDING.txt.gz',
    architecture: 'arch',
    colour: 'green',
    statusMessage: 'Build test status',
    dateStarted: '2017-03-07T12:29:45.297305+00:00',
    duration: '0:01:24.425045',
    reason: BUILD_TRIGGER_UNKNOWN
  };
  const TEST_BUILD_REQUEST = {
    isRequest: true,
    buildId: '123456',
    statusMessage: 'Building soon',
    colour: 'grey',
    dateCreated: '2016-11-09T17:05:52.436792+00:00',
    errorMessage: null,
    reason: BUILD_TRIGGER_UNKNOWN
  };
  const TEST_REPO = {
    fullName: 'anowner/aname'
  };

  let element;

  it('should display build reason column', () => {
    element = shallow(<BuildRow repository={TEST_REPO} {...TEST_BUILD} />);

    expect(element.find('Data').length).toBe(5);

    const column = shallow(element.find(Data).get(1));
    expect(column.html()).toInclude('Unknown');
  });

  context('when build was triggered by webhook', () => {
    it('should display commit as build reason', () => {
      const build = {
        ...TEST_BUILD,
        reason: BUILD_TRIGGERED_BY_WEBHOOK
      };

      element = shallow(<BuildRow repository={TEST_REPO} {...build} />);

      expect(element.find('Data').length).toBe(5);

      const column = shallow(element.find(Data).get(1));
      expect(column.html()).toInclude('Commit');
    });

    it('should display commit as build reason with link to GitHub', () => {
      const build = {
        ...TEST_BUILD,
        reason: BUILD_TRIGGERED_BY_WEBHOOK,
        commitId: 'ab1234'
      };

      element = shallow(<BuildRow repository={TEST_REPO} {...build} />);

      expect(element.find('Data').length).toBe(5);

      const column = shallow(element.find(Data).get(1));
      expect(column.html()).toInclude('Commit');
      expect(column.find('a').length).toBe(1);
      expect(column.html()).toInclude('ab1234');
    });
  });

  context('when build log is available', () => {
    beforeEach(() => {
      element = shallow(<BuildRow repository={TEST_REPO} {...TEST_BUILD} />);
    });

    it('should render Row', () => {
      expect(element.type()).toBe(Row);
    });

    it('should contain Link to build page', () => {
      const expectedUrl = `/user/${TEST_REPO.fullName}/${TEST_BUILD.buildId}`;
      expect(element.find(Link).length).toBe(1);
      expect(element.find(Link).prop('to')).toBe(expectedUrl);
    });

    it('should contain BuildStatus linked to build page', () => {
      const expectedUrl = `/user/${TEST_REPO.fullName}/${TEST_BUILD.buildId}`;
      expect(element.find('BuildStatus').length).toBe(1);
      expect(element.find('BuildStatus').prop('link')).toBe(expectedUrl);
    });
  });

  context('when build link is disabled', () => {
    beforeEach(() => {
      element = shallow(<BuildRow repository={TEST_REPO} {...TEST_BUILD} isLinked={false} />);
    });

    it('should render Row', () => {
      expect(element.type()).toBe(Row);
    });

    it('should not contain Link to build page', () => {
      expect(element.find(Link).length).toBe(0);
    });

    it('should contain BuildStatus not linked to build page', () => {
      expect(element.find('BuildStatus').length).toBe(1);
      expect(element.find('BuildStatus').prop('link')).toBe(null);
    });
  });

  context('when build log is not yet available', () => {
    beforeEach(() => {
      const buildWithoutLog = {
        ...TEST_BUILD,
        buildLogUrl: null
      };

      element = shallow(<BuildRow repository={TEST_REPO} {...buildWithoutLog} />);
    });

    it('should not contain Link to build page', () => {
      expect(element.find(Link).length).toBe(0);
    });

    it('should contain BuildStatus not linked to build page', () => {
      expect(element.find('BuildStatus').length).toBe(1);
      expect(element.find('BuildStatus').prop('link')).toBe(null);
    });
  });

  it('should display pending build request', () => {
    element = shallow(
      <BuildRow repository={TEST_REPO} {...TEST_BUILD_REQUEST} />
    );

    const dataRows = element.find('Data');
    expect(dataRows.length).toBe(3);
    expect(shallow(dataRows.get(0)).text()).toEqual('Requested');
    expect(shallow(dataRows.get(1)).text()).toEqual('Unknown');
    expect(shallow(dataRows.get(2)).text()).toEqual('');
  });
});
