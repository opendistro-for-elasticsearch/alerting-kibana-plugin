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

import Flyout from './Flyout';
import Flyouts from './flyouts';
jest.unmock('./flyouts');

describe('Flyout', () => {
  test('renders', () => {
    const wrapper = shallow(
      <Flyout flyout={{ type: 'message', payload: null }} onClose={jest.fn()} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  test('renders null if no flyout', () => {
    const wrapper = shallow(
      <Flyout flyout={{ type: 'definitely no flyout', payload: null }} onClose={jest.fn()} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  test('defaults if bad flyout data', () => {
    Flyouts.message = jest.fn(() => ({}));
    const wrapper = shallow(
      <Flyout flyout={{ type: 'message', payload: null }} onClose={jest.fn()} />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
