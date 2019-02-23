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
import DeleteConfirmation from './DeleteConfirmation';

describe('<DeleteConfirmation />', () => {
  test.skip('should render if isVisible is provided to true', () => {
    const wrapper = mount(
      <div>
        <DeleteConfirmation isVisible onConfirm={jest.fn()} onCancel={jest.fn()} />
      </div>
    );
    expect(wrapper).toMatchSnapshot();
  });
  test('should render null if isVisible is provided to false', () => {
    const wrapper = mount(
      <div>
        <DeleteConfirmation isVisible={false} onConfirm={jest.fn()} onCancel={jest.fn()} />
      </div>
    );
    expect(wrapper).toMatchSnapshot();
  });
  test('should call onConfirm on click of Confirm button', () => {
    const handleOnConfirm = jest.fn();
    const wrapper = mount(
      <DeleteConfirmation isVisible onConfirm={handleOnConfirm} onCancel={jest.fn()} />
    );
    // Simulate Confirm Click
    wrapper
      .find('button')
      .at(2)
      .simulate('click');
    expect(handleOnConfirm).toHaveBeenCalledTimes(1);
  });
  test('should call onCancel on click of Cancel button', () => {
    const handleOnCancel = jest.fn();
    const wrapper = mount(
      <DeleteConfirmation isVisible onConfirm={jest.fn()} onCancel={handleOnCancel} />
    );
    // Simulate Cancel Click
    wrapper
      .find('button')
      .at(1)
      .simulate('click');
    expect(handleOnCancel).toHaveBeenCalledTimes(1);
  });
});
