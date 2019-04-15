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
import { Formik } from 'formik';
import { mount } from 'enzyme';

import { FORMIK_INITIAL_VALUES } from '../CreateMonitor/utils/constants';
import MonitorIndex from './MonitorIndex';
import * as helpers from './utils/helpers';
import { httpClientMock } from '../../../../../test/mocks';

helpers.createReasonableWait = jest.fn(cb => cb());
httpClientMock.post.mockResolvedValue({ data: { ok: true, resp: [] } });

function getMountWrapper(customProps = {}) {
  return mount(
    <Formik
      initialValues={FORMIK_INITIAL_VALUES}
      render={() => <MonitorIndex httpClient={httpClientMock} {...customProps} />}
    />
  );
}

describe('MonitorIndex', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('renders', () => {
    const wrapper = getMountWrapper();
    expect(wrapper).toMatchSnapshot();
  });

  test('calls onSearchChange when changing input value', async () => {
    const onSearchChange = jest.spyOn(MonitorIndex.prototype, 'onSearchChange');
    const wrapper = getMountWrapper();
    wrapper
      .find('[data-test-subj="comboBoxSearchInput"]')
      .hostNodes()
      .simulate('change', { target: { value: 'random-index' } });
    setTimeout(() => {
      wrapper.update();
      expect(onSearchChange).toHaveBeenCalled();
      expect(onSearchChange).toHaveBeenCalledWith('random-index');
      done();
    });
  });

  test('appends wildcard when search is one valid character', () => {
    const wrapper = getMountWrapper();

    wrapper
      .find('[data-test-subj="comboBoxSearchInput"]')
      .hostNodes()
      .simulate('change', { target: { value: 'r' } });

    expect(wrapper.find(MonitorIndex).instance().state.appendedWildcard).toBe(true);
    expect((wrapper.find(MonitorIndex).instance().lastQuery = 'r*'));
  });

  test('searches space normalizes value', () => {
    const wrapper = getMountWrapper();

    wrapper
      .find('[data-test-subj="comboBoxSearchInput"]')
      .hostNodes()
      .simulate('change', { target: { value: ' ' } })
      .simulate('keyDown', { keyCode: 13 });

    expect(wrapper.find('.euiComboBoxPill')).toHaveLength(0);
  });

  test('searches resets appendedWildcard', () => {
    const wrapper = getMountWrapper();

    wrapper
      .find('[data-test-subj="comboBoxSearchInput"]')
      .hostNodes()
      .simulate('change', { target: { value: 'r' } });

    expect(wrapper.find(MonitorIndex).instance().state.appendedWildcard).toBe(true);
    expect((wrapper.find(MonitorIndex).instance().lastQuery = 'r*'));

    wrapper
      .find('[data-test-subj="comboBoxSearchInput"]')
      .hostNodes()
      .simulate('change', { target: { value: '*' } });

    expect(wrapper.find(MonitorIndex).instance().state.appendedWildcard).toBe(false);
    expect((wrapper.find(MonitorIndex).instance().lastQuery = ''));
  });

  test('returns empty alias/index array for *:', async () => {
    const wrapper = getMountWrapper();

    expect(
      await wrapper
        .find(MonitorIndex)
        .instance()
        .handleQueryAliases('*:')
    ).toEqual([]);
    expect(
      await wrapper
        .find(MonitorIndex)
        .instance()
        .handleQueryIndices('*:')
    ).toEqual([]);
  });

  test('returns empty array for data.ok = false', async () => {
    httpClientMock.post.mockResolvedValue({ data: { ok: false } });
    const wrapper = getMountWrapper();

    expect(
      await wrapper
        .find(MonitorIndex)
        .instance()
        .handleQueryAliases('random')
    ).toEqual([]);
    expect(
      await wrapper
        .find(MonitorIndex)
        .instance()
        .handleQueryIndices('random')
    ).toEqual([]);
  });
  //
  test('returns indices/aliases', async () => {
    httpClientMock.post.mockResolvedValue({
      data: {
        ok: true,
        resp: [{ health: 'green', status: 'open', index: 'logstash-0', alias: 'logstash' }],
      },
    });
    const wrapper = getMountWrapper();

    expect(
      await wrapper
        .find(MonitorIndex)
        .instance()
        .handleQueryAliases('l')
    ).toEqual([{ label: 'logstash', index: 'logstash-0' }]);
    expect(
      await wrapper
        .find(MonitorIndex)
        .instance()
        .handleQueryIndices('l')
    ).toEqual([{ health: 'green', status: 'open', label: 'logstash-0' }]);
  });

  test('onBlur sets index to touched', () => {
    httpClientMock.post.mockResolvedValue({
      data: {
        ok: true,
        resp: [{ health: 'green', status: 'open', index: 'logstash-0', alias: 'logstash' }],
      },
    });
    const wrapper = getMountWrapper();

    wrapper
      .find('[data-test-subj="comboBoxSearchInput"]')
      .hostNodes()
      .simulate('change', { target: { value: 'l' } })
      .simulate('blur');

    expect(wrapper.instance().state.touched).toEqual({ index: true });
  });

  test('sets option when calling onCreateOption', () => {
    httpClientMock.post.mockResolvedValue({
      data: {
        ok: true,
        resp: [{ health: 'green', status: 'open', index: 'logstash-0', alias: 'logstash' }],
      },
    });
    const wrapper = getMountWrapper();

    wrapper
      .find('[data-test-subj="comboBoxSearchInput"]')
      .hostNodes()
      .simulate('change', { target: { value: 'logstash-0' } });

    wrapper
      .find('[data-test-subj="comboBoxInput"]')
      .hostNodes()
      .simulate('keyDown', { keyCode: 40 })
      .simulate('keyDown', { keyCode: 13 });

    expect(wrapper.instance().state.values.index).toEqual([{ label: 'logstash-0' }]);
  });
});
