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

import DestinationsList from './DestinationsList';
import { historyMock, httpClientMock } from '../../../../../test/mocks';

const location = {
  hash: '',
  search: '',
  state: undefined,
};

const runAllPromises = () => new Promise(setImmediate);

describe('DestinationsList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders', () => {
    const wrapper = mount(
      <DestinationsList httpClient={httpClientMock} history={historyMock} location={location} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  test('getDestinations', async () => {
    const mockDestination = {
      id: 'id',
      type: 'test_action',
      name: 'destName',
      schema_version: 1,
      seq_no: 2,
      primary_term: 3,
      test_action: 'dummy',
    };

    // Mock return in getDestinations function
    httpClientMock.get.mockResolvedValue({
      data: { ok: true, destinations: [mockDestination], totalDestinations: 1 },
    });

    const wrapper = mount(
      <DestinationsList httpClient={httpClientMock} history={historyMock} location={location} />
    );

    await runAllPromises();

    expect(wrapper.instance().state.totalDestinations).toBe(1);
    expect(wrapper.instance().state.destinations.length).toBe(1);
    expect(wrapper.instance().state.destinations[0].id).toBe('id');
    expect(wrapper.instance().state.destinations[0].type).toBe('test_action');
    expect(wrapper.instance().state.destinations[0].name).toBe('destName');
    expect(wrapper.instance().state.destinations[0].schema_version).toBe(1);
    expect(wrapper.instance().state.destinations[0].seq_no).toBe(2);
    expect(wrapper.instance().state.destinations[0].primary_term).toBe(3);
    expect(wrapper.instance().state.destinations[0].test_action).toBe('dummy');
  });
});
