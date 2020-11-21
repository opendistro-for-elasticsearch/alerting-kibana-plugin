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
import { mount } from 'enzyme';

import Dashboard from './Dashboard';
import { historyMock, httpClientMock } from '../../../../test/mocks';

const location = {
  hash: '',
  search: '',
  state: undefined,
};

const runAllPromises = () => new Promise(setImmediate);

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders', () => {
    const resp = {
      ok: true,
      alerts: [],
      totalAlerts: 0,
    };

    httpClientMock.get = jest.fn().mockImplementation(() => Promise.resolve(resp));

    const wrapper = mount(
      <Dashboard httpClient={httpClientMock} history={historyMock} location={location} />
    );

    expect(wrapper).toMatchSnapshot();
  });

  test('getAlerts', async () => {
    const mockAlert = {
      id: 'id',
      version: 'version',
      monitor_id: 'monitor_id',
      monitor_name: 'monitor_name',
      monitor_version: 1,
      trigger_id: 'trigger_id',
      trigger_name: 'trigger_name',
      state: 'state',
      error_message: '',
      alert_history: [],
      severity: '1',
      action_execution_results: [],
    };

    const resp = {
      ok: true,
      alerts: [mockAlert],
      totalAlerts: 1,
    };

    // Mock return in getAlerts function
    httpClientMock.get = jest.fn().mockImplementation(() => Promise.resolve(resp));

    const wrapper = mount(
      <Dashboard httpClient={httpClientMock} history={historyMock} location={location} />
    );

    await runAllPromises();

    expect(wrapper.instance().state.totalAlerts).toBe(1);
    expect(wrapper.instance().state.alerts.length).toBe(1);
    expect(wrapper.instance().state.alerts[0].id).toBe('id');
    expect(wrapper.instance().state.alerts[0].version).toBe('version');
    expect(wrapper.instance().state.alerts[0].monitor_id).toBe('monitor_id');
    expect(wrapper.instance().state.alerts[0].monitor_name).toBe('monitor_name');
    expect(wrapper.instance().state.alerts[0].monitor_version).toBe(1);
    expect(wrapper.instance().state.alerts[0].trigger_id).toBe('trigger_id');
    expect(wrapper.instance().state.alerts[0].trigger_name).toBe('trigger_name');
    expect(wrapper.instance().state.alerts[0].severity).toBe('1');
    expect(wrapper.instance().state.alerts[0].action_execution_results).toStrictEqual([]);
    expect(wrapper.instance().state.alerts[0].alert_history).toStrictEqual([]);
    expect(wrapper.instance().state.alerts[0].error_message).toBe('');
  });
});
