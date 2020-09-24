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
import * as helpers from './utils/helpers';
import { httpClientMock } from '../../../../../../test/mocks';

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
        isVisible={true}
        onClickCancel={onClickCancel}
        onClickSave={onClickSave}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
