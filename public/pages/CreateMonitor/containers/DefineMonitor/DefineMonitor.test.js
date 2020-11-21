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

import DefineMonitor from './DefineMonitor';
import { FORMIK_INITIAL_VALUES } from '../CreateMonitor/utils/constants';
import { httpClientMock } from '../../../../../test/mocks';

function getShallowWrapper(customProps = {}) {
  return shallow(
    <DefineMonitor values={FORMIK_INITIAL_VALUES} httpClient={httpClientMock} {...customProps} />
  );
}

describe('DefineMonitor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    httpClientMock.post.mockResolvedValue({ ok: true, resp: [] });
    httpClientMock.get.mockResolvedValue({ ok: true, resp: [] });
  });

  test('renders', () => {
    const wrapper = getShallowWrapper();
    expect(wrapper).toMatchSnapshot();
  });

  test('mounting should not call onQueryMappings or onRunQuery if not graph type', () => {
    const onQueryMappings = jest.spyOn(DefineMonitor.prototype, 'onQueryMappings');
    const onRunQuery = jest.spyOn(DefineMonitor.prototype, 'onRunQuery');
    const values = { ...FORMIK_INITIAL_VALUES, searchType: 'query', timeField: '@timestamp' };
    const wrapper = getShallowWrapper({ values });
    expect(onQueryMappings).not.toHaveBeenCalled();
    expect(onRunQuery).not.toHaveBeenCalled();
  });

  test('mounting should not call onQueryMappings or onRunQuery if no indices selected', () => {
    const onQueryMappings = jest.spyOn(DefineMonitor.prototype, 'onQueryMappings');
    const onRunQuery = jest.spyOn(DefineMonitor.prototype, 'onRunQuery');
    const values = {
      ...FORMIK_INITIAL_VALUES,
      searchType: 'graph',
      timeField: '@timestamp',
      index: [],
    };
    const wrapper = getShallowWrapper({ values });
    expect(onQueryMappings).not.toHaveBeenCalled();
    expect(onRunQuery).not.toHaveBeenCalled();
  });

  test('mounting should call getPlugins', () => {
    const getPlugins = jest.spyOn(DefineMonitor.prototype, 'getPlugins');
    const values = { ...FORMIK_INITIAL_VALUES, searchType: 'ad' };
    const wrapper = getShallowWrapper({ values });
    expect(getPlugins).toHaveBeenCalled();
  });
  test('should show warning in case of Ad monitor and plugin is not installed', () => {
    const getPlugins = jest.spyOn(DefineMonitor.prototype, 'getPlugins');
    const values = { ...FORMIK_INITIAL_VALUES, searchType: 'ad' };
    const wrapper = getShallowWrapper({ values });
    expect(wrapper).toMatchSnapshot();
  });

  test('mounting should only call onQueryMappings if graph type and indices are selected, but no timefield', () => {
    const onQueryMappings = jest.spyOn(DefineMonitor.prototype, 'onQueryMappings');
    const onRunQuery = jest.spyOn(DefineMonitor.prototype, 'onRunQuery');
    const values = {
      ...FORMIK_INITIAL_VALUES,
      searchType: 'graph',
      timeField: '',
      index: [{ label: 'some_index' }],
    };
    const wrapper = getShallowWrapper({ values });
    expect(onQueryMappings).toHaveBeenCalled();
    expect(onRunQuery).not.toHaveBeenCalled();
  });

  test('mounting should call onQueryMappings and onRunQuery if graph type, indices are selected, and timefield exists', () => {
    const onQueryMappings = jest.spyOn(DefineMonitor.prototype, 'onQueryMappings');
    const onRunQuery = jest.spyOn(DefineMonitor.prototype, 'onRunQuery');
    const values = {
      ...FORMIK_INITIAL_VALUES,
      searchType: 'graph',
      timeField: '@timestamp',
      index: [{ label: 'some_index' }],
    };
    const wrapper = getShallowWrapper({ values });
    expect(onQueryMappings).toHaveBeenCalled();
    expect(onRunQuery).toHaveBeenCalled();
  });

  test('should call onQueryMappings and onRunQuery when switching from query type to graph type', () => {
    const onQueryMappings = jest.spyOn(DefineMonitor.prototype, 'onQueryMappings');
    const onRunQuery = jest.spyOn(DefineMonitor.prototype, 'onRunQuery');
    const values = {
      ...FORMIK_INITIAL_VALUES,
      searchType: 'query',
      timeField: '@timestamp',
      index: [{ label: 'some_index' }],
    };
    const wrapper = getShallowWrapper({ values });
    expect(onQueryMappings).not.toHaveBeenCalled();
    expect(onRunQuery).not.toHaveBeenCalled();
    wrapper.setProps({ httpClient: httpClientMock, values: { ...values, searchType: 'graph' } });
    wrapper.update();
    expect(onQueryMappings).toHaveBeenCalled();
    expect(onRunQuery).toHaveBeenCalled();
  });

  test('should call onQueryMappings and onRunQuery when changing indices', () => {
    const onQueryMappings = jest.spyOn(DefineMonitor.prototype, 'onQueryMappings');
    const onRunQuery = jest.spyOn(DefineMonitor.prototype, 'onRunQuery');
    const values = {
      ...FORMIK_INITIAL_VALUES,
      searchType: 'graph',
      timeField: '@timestamp',
      index: [],
    };
    const wrapper = getShallowWrapper({ values });
    expect(onQueryMappings).not.toHaveBeenCalled();
    expect(onRunQuery).not.toHaveBeenCalled();
    wrapper.setProps({
      httpClient: httpClientMock,
      values: { ...values, index: [{ label: 'some_index' }] },
    });
    wrapper.update();
    expect(onQueryMappings).toHaveBeenCalled();
    expect(onRunQuery).toHaveBeenCalled();
  });

  test('should call onRunQuery when changing timefield', () => {
    const onRunQuery = jest.spyOn(DefineMonitor.prototype, 'onRunQuery');
    const values = {
      ...FORMIK_INITIAL_VALUES,
      searchType: 'graph',
      timeField: '@timestamp',
      index: [{ label: 'some_index' }],
    };
    const wrapper = getShallowWrapper({ values });
    expect(onRunQuery).toHaveBeenCalledTimes(1); // on mount
    wrapper.setProps({
      httpClient: httpClientMock,
      values: { ...values, timeField: 'different_time_field' },
    });
    wrapper.update();
    expect(onRunQuery).toHaveBeenCalledTimes(2); // on update
  });

  test('resetResponse should reset the query responses', () => {
    const wrapper = getShallowWrapper();
    wrapper.setState({ response: {}, performanceResponse: {} });
    expect(wrapper.state().response).not.toBe(null);
    expect(wrapper.state().performanceResponse).not.toBe(null);
    wrapper.instance().resetResponse();
    expect(wrapper.state().response).toBe(null);
    expect(wrapper.state().performanceResponse).toBe(null);
  });
});
