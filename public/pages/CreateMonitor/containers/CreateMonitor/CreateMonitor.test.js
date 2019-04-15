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
import { shallow } from 'enzyme';

import CreateMonitor from './CreateMonitor';
import { historyMock, httpClientMock } from '../../../../../test/mocks';
import { FORMIK_INITIAL_VALUES } from './utils/constants';
import AlertingFakes from '../../../../../test/utils/helpers';

const alertingFakes = new AlertingFakes('CreateMonitor random seed');

const setFlyout = jest.fn();
const updateMonitor = jest.fn().mockResolvedValue({ data: { ok: true, id: 'monitor_id' } });
const formikBag = {
  setSubmitting: jest.fn(),
  setErrors: jest.fn(),
};
const match = {
  isExact: true,
  params: {},
  path: '/create-monitor',
  url: '/create-monitor',
};
const location = {
  hash: '',
  pathname: '/create-monitor',
  search: '',
  state: undefined,
};
beforeEach(() => {
  jest.clearAllMocks();
});

describe('CreateMonitor', () => {
  test('renders', () => {
    const wrapper = shallow(
      <CreateMonitor
        httpClient={httpClientMock}
        history={historyMock}
        setFlyout={setFlyout}
        match={match}
        location={location}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  test('uses monitorToEdit as initialValues when editing', () => {
    const monitor = alertingFakes.randomMonitor();
    const wrapper = shallow(
      <CreateMonitor
        httpClient={httpClientMock}
        edit={true}
        history={historyMock}
        setFlyout={setFlyout}
        updateMonitor={updateMonitor}
        monitorToEdit={monitor}
        match={match}
        location={location}
      />
    );
    expect(wrapper.instance().state.initialValues.name).toBe(monitor.name);
  });

  describe('onSubmit', () => {
    test('calls only onUpdate when editing', () => {
      const onCreate = jest.spyOn(CreateMonitor.prototype, 'onCreate');
      const onUpdate = jest.spyOn(CreateMonitor.prototype, 'onUpdate');
      const wrapper = shallow(
        <CreateMonitor
          httpClient={httpClientMock}
          edit={true}
          history={historyMock}
          setFlyout={setFlyout}
          updateMonitor={updateMonitor}
          monitorToEdit={null}
          match={match}
          location={location}
        />
      );
      wrapper.instance().onSubmit(FORMIK_INITIAL_VALUES, formikBag);
      expect(onUpdate).toHaveBeenCalledTimes(1);
      expect(onCreate).not.toHaveBeenCalled();
    });

    test('calls only onCreate when creating', () => {
      const onCreate = jest.spyOn(CreateMonitor.prototype, 'onCreate');
      const onUpdate = jest.spyOn(CreateMonitor.prototype, 'onUpdate');
      httpClientMock.post.mockResolvedValue({ data: { ok: true, resp: { _id: 'monitor_id' } } });
      const wrapper = shallow(
        <CreateMonitor
          httpClient={httpClientMock}
          history={historyMock}
          setFlyout={setFlyout}
          match={match}
          location={location}
        />
      );
      wrapper.instance().onSubmit(FORMIK_INITIAL_VALUES, formikBag);
      expect(onCreate).toHaveBeenCalledTimes(1);
      expect(onUpdate).not.toHaveBeenCalled();
    });
  });

  describe('onCancel', () => {
    test('calls history.goBack if editing', () => {
      const wrapper = shallow(
        <CreateMonitor
          httpClient={httpClientMock}
          edit={true}
          history={historyMock}
          setFlyout={setFlyout}
          updateMonitor={updateMonitor}
          monitorToEdit={null}
          match={match}
          location={location}
        />
      );
      wrapper.instance().onCancel();
      expect(historyMock.goBack).toHaveBeenCalledTimes(1);
      expect(historyMock.push).not.toHaveBeenCalled();
    });

    test('calls history.push when creating', () => {
      const wrapper = shallow(
        <CreateMonitor
          httpClient={httpClientMock}
          history={historyMock}
          setFlyout={setFlyout}
          match={match}
          location={location}
        />
      );
      wrapper.instance().onCancel();
      expect(historyMock.push).toHaveBeenCalledTimes(1);
      expect(historyMock.goBack).not.toHaveBeenCalled();
    });
  });

  describe('onUpdate', () => {
    test('calls updateMonitor with monitor with no triggers key', () => {
      const monitor = alertingFakes.randomMonitor();
      const trigger = alertingFakes.randomTrigger();
      monitor.triggers = [trigger];
      const wrapper = shallow(
        <CreateMonitor
          httpClient={httpClientMock}
          edit={true}
          history={historyMock}
          setFlyout={setFlyout}
          updateMonitor={updateMonitor}
          monitorToEdit={null}
          match={match}
          location={location}
        />
      );
      wrapper.instance().onUpdate(monitor, formikBag);
      expect(updateMonitor).toHaveBeenCalledTimes(1);
      // The updatedMonitor that is passed in should NOT have the trigger key
      const updatedMonitor = { ...monitor };
      delete updatedMonitor.triggers;
      expect(updateMonitor).toHaveBeenCalledWith(updatedMonitor);
    });

    test('logs error when updateMonitor rejects', async () => {
      const error = jest.spyOn(global.console, 'error');
      updateMonitor.mockRejectedValue(new Error('updateMonitor error'));
      const monitor = alertingFakes.randomMonitor();
      const wrapper = shallow(
        <CreateMonitor
          httpClient={httpClientMock}
          edit={true}
          history={historyMock}
          setFlyout={setFlyout}
          updateMonitor={updateMonitor}
          monitorToEdit={null}
          match={match}
          location={location}
        />
      );
      await wrapper.instance().onUpdate(monitor, formikBag);
      expect(error).toHaveBeenCalled();
    });

    test('logs resp.data when ok:false', async () => {
      const log = jest.spyOn(global.console, 'log');
      updateMonitor.mockResolvedValue({ data: { ok: false, resp: 'test' } });
      const monitor = alertingFakes.randomMonitor();
      const wrapper = shallow(
        <CreateMonitor
          httpClient={httpClientMock}
          edit={true}
          history={historyMock}
          setFlyout={setFlyout}
          updateMonitor={updateMonitor}
          monitorToEdit={null}
          match={match}
          location={location}
        />
      );
      await wrapper.instance().onUpdate(monitor, formikBag);
      expect(log).toHaveBeenCalled();
      expect(log).toHaveBeenCalledWith('Failed to update:', { ok: false, resp: 'test' });
    });
  });

  describe('onCreate', () => {
    test('calls post with monitor', () => {
      const monitor = alertingFakes.randomMonitor();
      httpClientMock.post.mockResolvedValue({ data: { ok: true, resp: { _id: 'id' } } });
      const wrapper = shallow(
        <CreateMonitor
          httpClient={httpClientMock}
          history={historyMock}
          setFlyout={setFlyout}
          match={match}
          location={location}
        />
      );
      wrapper.instance().onCreate(monitor, formikBag);
      expect(httpClientMock.post).toHaveBeenCalledTimes(1);
      expect(httpClientMock.post).toHaveBeenCalledWith('../api/alerting/monitors', monitor);
    });

    test('logs error when updateMonitor rejects', async () => {
      const error = jest.spyOn(global.console, 'error');
      httpClientMock.post.mockRejectedValue(new Error('onCreate error'));
      const monitor = alertingFakes.randomMonitor();
      const wrapper = shallow(
        <CreateMonitor
          httpClient={httpClientMock}
          history={historyMock}
          setFlyout={setFlyout}
          match={match}
          location={location}
        />
      );
      await wrapper.instance().onCreate(monitor, formikBag);
      expect(error).toHaveBeenCalled();
    });

    test('logs resp.data when ok:false', async () => {
      const log = jest.spyOn(global.console, 'log');
      httpClientMock.post.mockResolvedValue({ data: { ok: false, resp: 'test' } });
      const monitor = alertingFakes.randomMonitor();
      const wrapper = shallow(
        <CreateMonitor
          httpClient={httpClientMock}
          history={historyMock}
          setFlyout={setFlyout}
          match={match}
          location={location}
        />
      );
      await wrapper.instance().onCreate(monitor, formikBag);
      expect(log).toHaveBeenCalled();
      expect(log).toHaveBeenCalledWith('Failed to create:', { ok: false, resp: 'test' });
    });
  });
});
