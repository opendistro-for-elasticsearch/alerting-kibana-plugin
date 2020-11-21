/*
 *   Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import ManageSenders from './ManageSenders';
import { httpClientMock } from '../../../../../../test/mocks';

const runAllPromises = () => new Promise(setImmediate);

const onClickCancel = jest.fn();
const onClickSave = jest.fn();

describe('ManageSenders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders', () => {
    const wrapper = mount(
      <ManageSenders
        httpClient={httpClientMock}
        isEmailAllowed={true}
        isVisible={false}
        onClickCancel={onClickCancel}
        onClickSave={onClickSave}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  test('renders when visible', () => {
    const wrapper = mount(
      <ManageSenders
        httpClient={httpClientMock}
        isEmailAllowed={true}
        isVisible={true}
        onClickCancel={onClickCancel}
        onClickSave={onClickSave}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  test('renders when email is disallowed', () => {
    const wrapper = mount(
      <ManageSenders
        httpClient={httpClientMock}
        isEmailAllowed={false}
        isVisible={true}
        onClickCancel={onClickCancel}
        onClickSave={onClickSave}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  test('loadInitialValues', async () => {
    const mockEmailAccount = {
      id: 'id',
      name: 'test_account',
      email: 'test@email.com',
      host: 'smtp.test.com',
      port: 25,
      method: 'none',
    };

    // Mock return in getSenders function
    httpClientMock.get.mockResolvedValue({
      ok: true,
      emailAccounts: [mockEmailAccount],
    });

    const wrapper = mount(
      <ManageSenders
        httpClient={httpClientMock}
        isEmailAllowed={true}
        isVisible={true}
        onClickCancel={onClickCancel}
        onClickSave={onClickSave}
      />
    );

    await runAllPromises();
    expect(wrapper.instance().state.initialValues.senders.length).toBe(1);
    expect(wrapper.instance().state.initialValues.senders[0].name).toBe('test_account');
  });

  test('getSenders logs resp.err when ok:false', async () => {
    const log = jest.spyOn(global.console, 'log');
    // Mock return in getSenders function
    httpClientMock.get.mockResolvedValue({
      ok: false,
      err: 'test',
    });

    const wrapper = mount(
      <ManageSenders
        httpClient={httpClientMock}
        isEmailAllowed={true}
        isVisible={true}
        onClickCancel={onClickCancel}
        onClickSave={onClickSave}
      />
    );

    await runAllPromises();
    expect(log).toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith('Unable to get email accounts', 'test');
  });

  test('loads empty list of senders when ok:false', async () => {
    // Mock return in getSenders function
    httpClientMock.get.mockResolvedValue({
      ok: false,
      err: 'test',
    });

    const wrapper = mount(
      <ManageSenders
        httpClient={httpClientMock}
        isEmailAllowed={true}
        isVisible={true}
        onClickCancel={onClickCancel}
        onClickSave={onClickSave}
      />
    );

    await runAllPromises();
    expect(wrapper.instance().state.initialValues.senders).toEqual([]);
  });
});
