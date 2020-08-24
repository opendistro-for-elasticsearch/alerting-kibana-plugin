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
import _ from 'lodash';

import Monitors from './Monitors';
import { historyMock, httpClientMock } from '../../../../../test/mocks';
import AlertingFakes from '../../../../../test/utils/helpers';

const alertingFakes = new AlertingFakes('random seed');

jest.unmock('lodash');
_.debounce = jest.fn((fn) => fn);

const match = {
  isExact: true,
  params: {},
  path: '/monitors',
  url: '/monitors',
};
const location = {
  hash: '',
  pathname: '/monitors',
  search: '',
  state: undefined,
};

function getMountWrapper(customProps = {}) {
  return mount(
    <Monitors
      httpClient={httpClientMock}
      history={historyMock}
      match={match}
      location={location}
      {...customProps}
    />
  );
}

describe('Monitors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    httpClientMock.put.mockResolvedValue({ data: { ok: true } });
    httpClientMock.post.mockResolvedValue({ data: { ok: true } });
    httpClientMock.get.mockResolvedValue({ data: { ok: true, monitors: [], totalMonitors: 0 } });
    httpClientMock.delete.mockResolvedValue({ data: { ok: true } });
  });
  test('renders', () => {
    const wrapper = shallow(
      <Monitors
        httpClient={httpClientMock}
        history={historyMock}
        match={match}
        location={location}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  test('calls getMonitors on mount and whenever query params are updated', () => {
    const getMonitors = jest.spyOn(Monitors.prototype, 'getMonitors');
    const mountWrapper = getMountWrapper();
    expect(getMonitors).toHaveBeenCalledTimes(1);

    mountWrapper.setState({ size: 100 });
    mountWrapper.update();

    expect(getMonitors).toHaveBeenCalledTimes(2);
  });

  test('onTableChange updates page,size,sorts', () => {
    const onTableChange = jest.spyOn(Monitors.prototype, 'onTableChange');
    const mountWrapper = getMountWrapper();
    expect(mountWrapper.instance().state.page).not.toBe(17);
    expect(mountWrapper.instance().state.size).not.toBe(17);
    expect(mountWrapper.instance().state.sortField).not.toBe('testing_sort_field');
    expect(mountWrapper.instance().state.sortDirection).not.toBe('asc');
    mountWrapper.instance().onTableChange({
      page: { index: 17, size: 17 },
      sort: { field: 'testing_sort_field', direction: 'desc' },
    });
    mountWrapper.update();

    expect(onTableChange).toHaveBeenCalled();
    expect(mountWrapper.instance().state.page).toBe(17);
    expect(mountWrapper.instance().state.size).toBe(17);
    expect(mountWrapper.instance().state.sortField).toBe('testing_sort_field');
    expect(mountWrapper.instance().state.sortDirection).toBe('desc');
  });

  test('onMonitorStateChange sets new monitorState and resets page to 0', () => {
    const onMonitorStateChange = jest.spyOn(Monitors.prototype, 'onMonitorStateChange');
    const mountWrapper = getMountWrapper();
    mountWrapper.setState({ page: 2 });
    mountWrapper.update();
    expect(mountWrapper.instance().state.page).toBe(2);
    mountWrapper.instance().onMonitorStateChange({ target: { value: 'NEW_STATE' } });
    mountWrapper.update();

    expect(onMonitorStateChange).toHaveBeenCalled();
    expect(mountWrapper.instance().state.monitorState).toBe('NEW_STATE');
    expect(mountWrapper.instance().state.page).toBe(0);
  });

  test('onSelectionChange updates selectedItems', () => {
    const onSelectionChange = jest.spyOn(Monitors.prototype, 'onSelectionChange');
    const mountWrapper = getMountWrapper();
    expect(mountWrapper.instance().state.selectedItems).toEqual([]);
    mountWrapper.instance().onSelectionChange([{ id: 'item_id', version: 17 }]);
    mountWrapper.update();

    expect(onSelectionChange).toHaveBeenCalled();
    expect(mountWrapper.instance().state.selectedItems).toEqual([{ id: 'item_id', version: 17 }]);
  });

  test('onSearchChange sets search value and resets page', () => {
    const onSearchChange = jest.spyOn(Monitors.prototype, 'onSearchChange');
    const mountWrapper = getMountWrapper();
    mountWrapper.setState({ page: 2 });
    mountWrapper.update();
    expect(mountWrapper.instance().state.search).toBe('');
    expect(mountWrapper.instance().state.page).toBe(2);
    mountWrapper.instance().onSearchChange({ target: { value: 'test' } });
    mountWrapper.update();

    expect(onSearchChange).toHaveBeenCalled();
    expect(mountWrapper.instance().state.search).toBe('test');
    expect(mountWrapper.instance().state.page).toBe(0);
  });

  test('updateMonitor calls put with update', async () => {
    const updateMonitor = jest.spyOn(Monitors.prototype, 'updateMonitor');
    httpClientMock.put = jest
      .fn()
      .mockResolvedValueOnce({ data: { ok: true } })
      .mockRejectedValueOnce(new Error('random error'));
    const mountWrapper = getMountWrapper();
    const monitor = alertingFakes.randomMonitor();
    const response = await mountWrapper
      .instance()
      .updateMonitor(
        { id: 'random_id', ifSeqNo: 17, ifPrimaryTerm: 20, monitor },
        { name: 'UNIQUE_NAME' }
      );
    mountWrapper.update();

    expect(updateMonitor).toHaveBeenCalled();
    expect(httpClientMock.put).toHaveBeenCalled();
    expect(
      httpClientMock.put
    ).toHaveBeenCalledWith(`../api/alerting/monitors/random_id?ifSeqNo=17&ifPrimaryTerm=20`, {
      ...monitor,
      name: 'UNIQUE_NAME',
    });
    expect(response).toEqual({ data: { ok: true } });
    const error = await mountWrapper
      .instance()
      .updateMonitor(
        { id: 'random_id', ifSeqNo: 17, ifPrimaryTerm: 20, monitor },
        { name: 'UNIQUE_NAME' }
      );
    expect(httpClientMock.put).toHaveBeenCalledTimes(2);
    expect(error.message).toBe('random error');
  });

  test('deleteMonitor calls delete', async () => {
    const deleteMonitor = jest.spyOn(Monitors.prototype, 'deleteMonitor');
    httpClientMock.delete = jest
      .fn()
      .mockResolvedValueOnce({ data: { ok: true } })
      .mockRejectedValueOnce(new Error('random delete error'));
    const mountWrapper = getMountWrapper();
    const response = await mountWrapper.instance().deleteMonitor({ id: 'delete_id', version: 15 });
    mountWrapper.update();

    expect(deleteMonitor).toHaveBeenCalled();
    expect(httpClientMock.delete).toHaveBeenCalled();
    expect(httpClientMock.delete).toHaveBeenCalledWith(
      `../api/alerting/monitors/delete_id?version=15`
    );
    expect(response).toEqual({ data: { ok: true } });
    const error = await mountWrapper.instance().deleteMonitor({ id: 'delete_id', version: 15 });
    expect(httpClientMock.delete).toHaveBeenCalledTimes(2);
    expect(error.message).toBe('random delete error');
  });

  test('onClickAcknowledge calls getActiveAlerts with monitor', () => {
    const onClickAcknowledge = jest.spyOn(Monitors.prototype, 'onClickAcknowledge');
    const getActiveAlerts = jest.spyOn(Monitors.prototype, 'getActiveAlerts');
    const mountWrapper = getMountWrapper();
    const monitor = alertingFakes.randomMonitor();
    httpClientMock.get.mockResolvedValue({ data: { ok: true, alerts: [], totalAlerts: 0 } });
    mountWrapper.instance().onClickAcknowledge(monitor);

    expect(onClickAcknowledge).toHaveBeenCalled();
    expect(getActiveAlerts).toHaveBeenCalled();
    expect(getActiveAlerts).toHaveBeenCalledWith([monitor]);
  });

  test('onClickAcknowledgeModal acknowledges selected alerts for each monitor', async () => {
    const onClickAcknowledgeModal = jest.spyOn(Monitors.prototype, 'onClickAcknowledgeModal');
    const mountWrapper = getMountWrapper();
    const alerts = [
      { id: 'alert_1', monitor_id: 'monitor_1' },
      { id: 'alert_2', monitor_id: 'monitor_1' },
      { id: 'alert_1', monitor_id: 'monitor_2' },
    ];
    await mountWrapper.instance().onClickAcknowledgeModal(alerts);

    expect(onClickAcknowledgeModal).toHaveBeenCalled();
    expect(onClickAcknowledgeModal).toHaveBeenCalledWith(alerts);
    expect(httpClientMock.post).toHaveBeenCalledTimes(2);
    expect(httpClientMock.post).toHaveBeenNthCalledWith(
      1,
      `../api/alerting/monitors/monitor_1/_acknowledge/alerts`,
      { alerts: ['alert_1', 'alert_2'] }
    );
    expect(httpClientMock.post).toHaveBeenNthCalledWith(
      2,
      `../api/alerting/monitors/monitor_2/_acknowledge/alerts`,
      { alerts: ['alert_1'] }
    );
  });

  test('onClickEdit calls history.push', () => {
    const onClickEdit = jest.spyOn(Monitors.prototype, 'onClickEdit');
    const mountWrapper = getMountWrapper();
    const monitor = alertingFakes.randomMonitor();

    mountWrapper.setState({ selectedItems: [{ id: 'random_id', version: 17, monitor }] });
    mountWrapper.instance().onClickEdit();

    expect(onClickEdit).toHaveBeenCalled();
    expect(historyMock.push).toHaveBeenCalled();
    expect(historyMock.push).toHaveBeenCalledWith(`/monitors/random_id?action=update-monitor`);
  });

  test('onClickEnable calls updateMonitors with monitor and enable:true update', () => {
    const onClickEnable = jest.spyOn(Monitors.prototype, 'onClickEnable');
    const updateMonitors = jest.spyOn(Monitors.prototype, 'updateMonitors');
    const mountWrapper = getMountWrapper();
    const monitor = alertingFakes.randomMonitor();
    mountWrapper.instance().onClickEnable(monitor);

    expect(onClickEnable).toHaveBeenCalled();
    expect(updateMonitors).toHaveBeenCalled();
    expect(updateMonitors).toHaveBeenCalledWith([monitor], { enabled: true });
  });

  test('onClickDelete calls deleteMonitors with monitor', () => {
    const onClickDelete = jest.spyOn(Monitors.prototype, 'onClickDelete');
    const deleteMonitors = jest.spyOn(Monitors.prototype, 'deleteMonitors');
    const mountWrapper = getMountWrapper();
    const monitor = alertingFakes.randomMonitor();
    mountWrapper.instance().onClickDelete(monitor);

    expect(onClickDelete).toHaveBeenCalled();
    expect(deleteMonitors).toHaveBeenCalled();
    expect(deleteMonitors).toHaveBeenCalledWith([monitor]);
  });

  test('onClickDisable calls updateMonitors with monitor and enable:false update', () => {
    const onClickDisable = jest.spyOn(Monitors.prototype, 'onClickDisable');
    const updateMonitors = jest.spyOn(Monitors.prototype, 'updateMonitors');
    const mountWrapper = getMountWrapper();
    const monitor = alertingFakes.randomMonitor();
    mountWrapper.instance().onClickDisable(monitor);

    expect(onClickDisable).toHaveBeenCalled();
    expect(updateMonitors).toHaveBeenCalled();
    expect(updateMonitors).toHaveBeenCalledWith([monitor], { enabled: false });
  });

  test('onBulkAcknowledge calls getActiveAlerts with selectedItems', () => {
    const onBulkAcknowledge = jest.spyOn(Monitors.prototype, 'onBulkAcknowledge');
    const getActiveAlerts = jest.spyOn(Monitors.prototype, 'getActiveAlerts');
    const mountWrapper = getMountWrapper();
    const monitor = alertingFakes.randomMonitor();
    const selectedItems = [{ id: 'selected_items', version: 17, monitor }];
    mountWrapper.setState({ selectedItems });
    mountWrapper.update();

    httpClientMock.get.mockResolvedValue({ data: { ok: true, alerts: [], totalAlerts: 0 } });
    mountWrapper.instance().onBulkAcknowledge();

    expect(onBulkAcknowledge).toHaveBeenCalled();
    expect(getActiveAlerts).toHaveBeenCalled();
    expect(getActiveAlerts).toHaveBeenCalledWith(selectedItems);
  });

  test('onBulkEnable calls updateMonitors with selectedItems and enabled:true update', () => {
    const onBulkEnable = jest.spyOn(Monitors.prototype, 'onBulkEnable');
    const updateMonitors = jest.spyOn(Monitors.prototype, 'updateMonitors');
    const mountWrapper = getMountWrapper();
    const monitor = alertingFakes.randomMonitor();
    const selectedItems = [{ id: 'bulkenable', version: 15, monitor }];

    mountWrapper.setState({ selectedItems });
    mountWrapper.update();
    mountWrapper.instance().onBulkEnable();

    expect(onBulkEnable).toHaveBeenCalled();
    expect(updateMonitors).toHaveBeenCalled();
    expect(updateMonitors).toHaveBeenCalledWith(selectedItems, { enabled: true });
  });

  test('onBulkDelete calls deleteMonitors with selectedItems', () => {
    const onBulkDelete = jest.spyOn(Monitors.prototype, 'onBulkDelete');
    const deleteMonitors = jest.spyOn(Monitors.prototype, 'deleteMonitors');
    const mountWrapper = getMountWrapper();
    const monitor = alertingFakes.randomMonitor();
    const selectedItems = [{ id: 'selected', version: 15, monitor }];

    mountWrapper.setState({ selectedItems });
    mountWrapper.update();

    mountWrapper.instance().onBulkDelete();

    expect(onBulkDelete).toHaveBeenCalled();
    expect(deleteMonitors).toHaveBeenCalled();
    expect(deleteMonitors).toHaveBeenCalledWith(selectedItems);
  });

  test('onBulkDisable calls updateMonitors with selectedItems and update to apply', () => {
    const onBulkDisable = jest.spyOn(Monitors.prototype, 'onBulkDisable');
    const updateMonitors = jest.spyOn(Monitors.prototype, 'updateMonitors');
    const mountWrapper = getMountWrapper();
    const monitor = alertingFakes.randomMonitor();
    const selectedItems = [{ id: 'selected', version: 15, monitor }];

    mountWrapper.setState({ selectedItems });
    mountWrapper.update();

    mountWrapper.instance().onBulkDisable();

    expect(onBulkDisable).toHaveBeenCalled();
    expect(updateMonitors).toHaveBeenCalled();
    expect(updateMonitors).toHaveBeenCalledWith(selectedItems, { enabled: false });
  });

  test('onPageClick sets page', () => {
    const onPageClick = jest.spyOn(Monitors.prototype, 'onPageClick');
    const mountWrapper = getMountWrapper();
    mountWrapper.setState({ page: 17 });
    mountWrapper.update();
    expect(mountWrapper.instance().state.page).toBe(17);
    mountWrapper.instance().onPageClick(12);
    mountWrapper.update();
    expect(onPageClick).toHaveBeenCalled();
    expect(mountWrapper.instance().state.page).toBe(12);
  });

  test('getActiveAlerts returns early if no monitors', async () => {
    const getActiveAlerts = jest.spyOn(Monitors.prototype, 'getActiveAlerts');
    const mountWrapper = getMountWrapper();
    expect(httpClientMock.get).toHaveBeenCalledTimes(1);
    await mountWrapper.instance().getActiveAlerts([]);
    mountWrapper.update();

    expect(getActiveAlerts).toHaveBeenCalled();
    expect(httpClientMock.get).toHaveBeenCalledTimes(1);
  });

  test('onClickCancel hides acknowledge modal', () => {
    const onClickCancel = jest.spyOn(Monitors.prototype, 'onClickCancel');
    const mountWrapper = getMountWrapper();
    mountWrapper.setState({ showAcknowledgeModal: true });
    mountWrapper.update();
    expect(mountWrapper.instance().state.showAcknowledgeModal).toBe(true);
    mountWrapper.instance().onClickCancel();
    mountWrapper.update();
    expect(onClickCancel).toHaveBeenCalled();
    expect(mountWrapper.instance().state.showAcknowledgeModal).toBe(false);
  });

  test('resetFilters resets search and state', () => {
    const resetFilters = jest.spyOn(Monitors.prototype, 'resetFilters');
    const mountWrapper = getMountWrapper();
    mountWrapper.setState({ search: 'searched', monitorState: 'NOT_ALL' });
    mountWrapper.update();
    expect(mountWrapper.instance().state.search).toBe('searched');
    expect(mountWrapper.instance().state.monitorState).toBe('NOT_ALL');
    mountWrapper.instance().resetFilters();
    mountWrapper.update();
    expect(resetFilters).toHaveBeenCalled();
    expect(mountWrapper.instance().state.search).toBe('');
    expect(mountWrapper.instance().state.monitorState).toBe('all');
  });

  test('getItemId returns formatted id for table', () => {
    const getItemId = jest.spyOn(Monitors.prototype, 'getItemId');
    const mountWrapper = getMountWrapper();
    const response = mountWrapper
      .instance()
      .getItemId({ id: 'item_id', currentTime: 143534534345 });

    expect(getItemId).toHaveBeenCalled();
    expect(response).toBe('item_id-143534534345');
  });
});
