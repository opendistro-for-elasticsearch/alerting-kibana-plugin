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
import moment from 'moment-timezone';
import { set } from 'lodash';
import { mount } from 'enzyme';
import { getPOIResponse, getAlertsResponse } from './testHelpers';
import MonitorHistory from '../MonitorHistory';

moment.tz.setDefault('America/Los_Angeles');

describe('<MonitorHistory/>', () => {
  const initialStartTime = moment('2018-10-15T09:00:00');
  const triggers = [
    {
      name: 'Trigger 1',
      id: '1',
    },
    {
      name: 'Trigger 2',
      id: '2',
    },
  ];
  const httpClient = {
    post: jest.fn(),
    get: jest.fn(),
  };
  beforeEach(() => {
    jest.resetAllMocks();
  });
  test('should show <EmptyHistory/> if no triggers found', (done) => {
    const wrapper = mount(
      <MonitorHistory
        httpClient={httpClient}
        monitorId={'123'}
        onShowTrigger={jest.fn()}
        triggers={[]}
      />
    );
    process.nextTick(() => {
      wrapper.update();
      expect(httpClient.post).toHaveBeenCalledTimes(0);
      expect(wrapper.find('EmptyHistory').length).toBe(1);
      done();
    });
  });
  test('should execute getPOIData, getAlerts on componentDidMount', (done) => {
    const poiResponse = getPOIResponse(initialStartTime);
    httpClient.post.mockResolvedValueOnce(poiResponse);
    httpClient.get.mockResolvedValue({
      ok: true,
      alerts: [],
    });
    const wrapper = mount(
      <MonitorHistory
        httpClient={httpClient}
        monitorId={'123'}
        onShowTrigger={jest.fn()}
        triggers={triggers}
      />
    );
    process.nextTick(() => {
      wrapper.update();
      expect(wrapper.state().poiData).toEqual(
        poiResponse.resp.aggregations.alerts_over_time.buckets.map((item) => ({
          x: item.key,
          y: item.doc_count,
        }))
      );
      expect(httpClient.post).toHaveBeenCalledTimes(1);
      expect(httpClient.get).toHaveBeenCalledTimes(1);
      expect(wrapper.state().maxAlerts).toBe(poiResponse.resp.aggregations.max_alerts.value);
      const triggersData = wrapper.state().triggersData;
      const triggersDataKeys = Object.keys(triggersData);
      expect(triggersDataKeys.length).toBe(2);
      // Validate Ids
      expect(triggersDataKeys[0]).toBe('1');
      expect(triggersDataKeys[1]).toBe('2');
      // Should be not alerting state
      expect(triggersData[triggersDataKeys[0]].length).toBe(1);
      expect(triggersData[triggersDataKeys[1]].length).toBe(1);
      done();
    });
  });
  test('should get 60 mins highlight windowSize', (done) => {
    const poiResponse = getPOIResponse(initialStartTime);
    httpClient.post.mockResolvedValueOnce(poiResponse);
    httpClient.get.mockResolvedValue({
      ok: true,
      alerts: [],
    });
    const wrapper = mount(
      <MonitorHistory
        httpClient={httpClient}
        monitorId={'123'}
        onShowTrigger={jest.fn()}
        triggers={triggers}
      />
    );
    process.nextTick(() => {
      wrapper.update();
      const timeSeriesWindow = wrapper.state().timeSeriesWindow;
      expect(
        moment.duration(timeSeriesWindow.endTime - timeSeriesWindow.startTime).asMinutes()
      ).toBe(60);
      done();
    });
  });
  test('should create appropriate alerts data', (done) => {
    const poiResponse = getPOIResponse(initialStartTime);
    Date.now = jest.fn(() => 1539619200000);
    const alerts = triggers.map((trigger) => [
      getAlertsResponse(
        trigger.id,
        trigger.name,
        '123',
        'Hello',
        moment('2018-10-15T09:00:00').subtract(1, 'h')
      ),
    ]);
    httpClient.post.mockResolvedValueOnce(poiResponse);
    httpClient.get.mockResolvedValue({
      ok: true,
      alerts: alerts,
    });
    const wrapper = mount(
      <MonitorHistory
        httpClient={httpClient}
        monitorId={'123'}
        onShowTrigger={jest.fn()}
        triggers={triggers}
      />
    );
    process.nextTick(() => {
      wrapper.update();
      const triggersData = wrapper.state().triggersData;
      expect(triggersData).toMatchSnapshot();

      done();
    });
  });
  test('should fetch new data on timeSeriesWindow change ', (done) => {
    const poiResponse = getPOIResponse(initialStartTime);
    Date.now = jest.fn(() => 1539619200000);
    httpClient.post.mockResolvedValue({ ok: true }).mockResolvedValueOnce(poiResponse);
    httpClient.get.mockResolvedValue({
      ok: true,
      alerts: [],
    });
    const wrapper = mount(
      <MonitorHistory
        httpClient={httpClient}
        monitorId={'123'}
        onShowTrigger={jest.fn()}
        triggers={triggers}
      />
    );

    const getAlertsSpy = jest.spyOn(wrapper.instance(), 'getAlerts');

    process.nextTick(() => {
      const draggedWindow = {
        startWindow: moment('2018-10-14T09:00:00'),
        endWindow: moment('2018-10-14T10:00:00'),
      };
      // Clear previous calls
      jest.resetAllMocks();
      wrapper.instance().handleDragEnd({
        left: draggedWindow.startWindow.toDate(),
        right: draggedWindow.startWindow.toDate(),
      });
      wrapper.update();
      expect(wrapper.state().timeSeriesWindow).toMatchSnapshot();
      expect(getAlertsSpy).toHaveBeenCalledTimes(1);
      done();
    });
  });
  test('should fall back to max scale if the max alerts are lower than threshold ', (done) => {
    const poiResponse = getPOIResponse(initialStartTime);
    set(poiResponse, 'resp.aggregations.max_alerts.value', 3);

    Date.now = jest.fn(() => 1539619200000);
    httpClient.post.mockResolvedValue({ ok: true }).mockResolvedValueOnce(poiResponse);
    httpClient.get.mockResolvedValue({
      ok: true,
      alerts: [],
    });
    const wrapper = mount(
      <MonitorHistory
        httpClient={httpClient}
        monitorId={'123'}
        onShowTrigger={jest.fn()}
        triggers={triggers}
      />
    );
    process.nextTick(() => {
      wrapper.update();
      expect(wrapper.find('POIChart').props().yDomain).toEqual([0, 5]);
      done();
    });
  });
});
