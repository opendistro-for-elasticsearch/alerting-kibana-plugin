/*
 *   Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

import React from 'react';
import { mount, shallow } from 'enzyme';
import { EuiBreadcrumbs } from '@elastic/eui';

import Breadcrumbs, {
  createEuiBreadcrumb,
  getBreadcrumbs,
  parseLocationHash,
  getBreadcrumb,
} from './Breadcrumbs';
import { historyMock, httpClientMock } from '../../../test/mocks';
import { MONITOR_ACTIONS, TRIGGER_ACTIONS } from '../../utils/constants';

const monitorId = 'soDk30SjdsekoaSoMcj1';
const location = {
  hash: '',
  pathname: '/monitors/random_id_20_chars__',
  search: '',
  state: undefined,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Breadcrumbs', () => {
  const title = 'Alerting';
  httpClientMock.get = jest
    .fn()
    .mockResolvedValue({ data: { ok: true, resp: { name: 'random monitor' } } });
  delete global.window.location;
  global.window.location = { hash: '' };

  test('renders', () => {
    const wrapper = shallow(
      <Breadcrumbs
        title={title}
        location={location}
        httpClient={httpClientMock}
        history={historyMock}
      />
    );

    expect(wrapper).toMatchSnapshot();
  });

  test('calls getBreadcrumbs on mount and when pathname+search are updated', () => {
    const getBreadcrumbs = jest.spyOn(Breadcrumbs.prototype, 'getBreadcrumbs');
    const wrapper = mount(
      <Breadcrumbs
        title={title}
        location={location}
        httpClient={httpClientMock}
        history={historyMock}
      />
    );

    expect(getBreadcrumbs).toHaveBeenCalledTimes(1);
    wrapper.setProps({ location: { ...location, search: '?search=new' } });
    expect(getBreadcrumbs).toHaveBeenCalledTimes(2);
  });
});

describe('createEuiBreadcrumbs', () => {
  test('creates breadcrumbs for EuiBreadcrumbs', () => {
    const breadcrumb = { text: 'This is a breadcrumb', href: '/this-is-the-href' };
    expect(createEuiBreadcrumb(breadcrumb, historyMock)).toMatchSnapshot();
  });
});

describe('parseLocationHash', () => {
  test('correctly parses location hash', () => {
    const hash = `#/monitors/${monitorId}?action=${TRIGGER_ACTIONS.CREATE_TRIGGER}`;
    expect(parseLocationHash(hash)).toMatchSnapshot();
  });

  test('filters out falsy string values', () => {
    const hash = '#/monitors/';
    expect(parseLocationHash(hash)).toMatchSnapshot();
  });
});

describe('getBreadcrumb', () => {
  const routeState = { destinationToEdit: { name: 'unique_name' } };
  test('returns null if falsy base value', async () => {
    expect(await getBreadcrumb('', {}, httpClientMock)).toBe(null);
    expect(
      await getBreadcrumb(`?action=${TRIGGER_ACTIONS.CREATE_TRIGGER}`, {}, httpClientMock)
    ).toBe(null);
  });

  test('returns correct constant breadcrumbs', async () => {
    expect(await getBreadcrumb('#', {}, httpClientMock)).toMatchSnapshot();
    expect(await getBreadcrumb('monitors', {}, httpClientMock)).toMatchSnapshot();
    expect(await getBreadcrumb('dashboard', {}, httpClientMock)).toMatchSnapshot();
    expect(await getBreadcrumb('destinations', {}, httpClientMock)).toMatchSnapshot();
    expect(await getBreadcrumb('create-monitor', {}, httpClientMock)).toMatchSnapshot();
    expect(await getBreadcrumb('create-destination', {}, httpClientMock)).toMatchSnapshot();
  });

  describe('when matching document IDs', () => {
    test('calls get monitor route', async () => {
      httpClientMock.get.mockResolvedValue({ data: { ok: true, resp: { name: 'random_name' } } });
      await getBreadcrumb(monitorId, {}, httpClientMock);
      expect(httpClientMock.get).toHaveBeenCalled();
      expect(httpClientMock.get).toHaveBeenCalledWith(`../api/alerting/monitors/${monitorId}`);
    });

    test('returns monitor name', async () => {
      httpClientMock.get.mockResolvedValue({ data: { ok: true, resp: { name: 'random_name' } } });
      expect(await getBreadcrumb(monitorId, {}, httpClientMock)).toMatchSnapshot();
    });

    test('uses monitor id as name if request fails', async () => {
      httpClientMock.get.mockRejectedValue({ data: { ok: true, resp: { name: 'random_name' } } });
      expect(await getBreadcrumb(monitorId, {}, httpClientMock)).toMatchSnapshot();
    });

    test('uses monitor id as name if ok=false', async () => {
      httpClientMock.get.mockResolvedValue({ data: { ok: false, resp: { name: 'random_name' } } });
      expect(await getBreadcrumb(monitorId, {}, httpClientMock)).toMatchSnapshot();
    });

    test('adds appropriate action breadcrumb', async () => {
      httpClientMock.get.mockResolvedValue({ data: { ok: true, resp: { name: 'random_name' } } });
      expect(
        await getBreadcrumb(
          `${monitorId}?action=${MONITOR_ACTIONS.UPDATE_MONITOR}`,
          {},
          httpClientMock
        )
      ).toMatchSnapshot();
      expect(
        await getBreadcrumb(
          `${monitorId}?action=${TRIGGER_ACTIONS.CREATE_TRIGGER}`,
          {},
          httpClientMock
        )
      ).toMatchSnapshot();
      expect(
        await getBreadcrumb(
          `${monitorId}?action=${TRIGGER_ACTIONS.UPDATE_TRIGGER}`,
          {},
          httpClientMock
        )
      ).toMatchSnapshot();
    });
  });
});
