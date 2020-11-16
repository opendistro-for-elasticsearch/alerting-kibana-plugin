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

import ManageEmailGroups from './ManageEmailGroups';
import { httpClientMock } from '../../../../../../test/mocks';

const runAllPromises = () => new Promise(setImmediate);

const onClickCancel = jest.fn();
const onClickSave = jest.fn();

describe('ManageEmailGroups', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders', () => {
    const wrapper = mount(
      <ManageEmailGroups
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
      <ManageEmailGroups
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
      <ManageEmailGroups
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
    const mockEmailGroup = {
      id: 'id',
      name: 'test_group',
      emails: [{ email: 'test@email.com' }],
    };

    // Mock return in getEmailGroups function
    httpClientMock.get.mockResolvedValue({
      ok: true,
      emailGroups: [mockEmailGroup],
    });

    const wrapper = mount(
      <ManageEmailGroups
        httpClient={httpClientMock}
        isEmailAllowed={true}
        isVisible={true}
        onClickCancel={onClickCancel}
        onClickSave={onClickSave}
      />
    );

    await runAllPromises();
    expect(wrapper.instance().state.initialValues.emailGroups.length).toBe(1);
    expect(wrapper.instance().state.initialValues.emailGroups[0].emails).toEqual([
      { label: 'test@email.com' },
    ]);
  });

  test('getEmailGroups logs resp.err when ok:false', async () => {
    const log = jest.spyOn(global.console, 'log');
    // Mock return in getEmailGroups function
    httpClientMock.get.mockResolvedValue({
      ok: false,
      err: 'test',
    });

    const wrapper = mount(
      <ManageEmailGroups
        httpClient={httpClientMock}
        isEmailAllowed={true}
        isVisible={true}
        onClickCancel={onClickCancel}
        onClickSave={onClickSave}
      />
    );

    await runAllPromises();
    expect(log).toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith('Unable to get email groups', 'test');
  });

  test('loads empty list of email groups when ok:false', async () => {
    // Mock return in getEmailGroups function
    httpClientMock.get.mockResolvedValue({
      ok: false,
      err: 'test',
    });

    const wrapper = mount(
      <ManageEmailGroups
        httpClient={httpClientMock}
        isEmailAllowed={true}
        isVisible={true}
        onClickCancel={onClickCancel}
        onClickSave={onClickSave}
      />
    );

    await runAllPromises();
    expect(wrapper.instance().state.initialValues.emailGroups).toEqual([]);
  });
});
