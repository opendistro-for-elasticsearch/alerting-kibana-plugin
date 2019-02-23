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
import { render, shallow, mount } from 'enzyme';

import MonitorActions from './MonitorActions';

const getProps = () => ({
  onBulkAcknowledge: jest.fn(),
  onBulkEnable: jest.fn(),
  onBulkDisable: jest.fn(),
  onBulkDelete: jest.fn(),
  isEditDisabled: true,
  onClickEdit: jest.fn(),
});

describe('MonitorActions', () => {
  test('renders', () => {
    const component = <MonitorActions {...getProps()} />;
    expect(render(component)).toMatchSnapshot();
  });

  test('toggles isActionOpen when calling onClickActions', () => {
    const wrapper = shallow(<MonitorActions {...getProps()} />);
    const instance = wrapper.instance();
    expect(wrapper.state('isActionsOpen')).toBe(false);
    instance.onClickActions();
    expect(wrapper.state('isActionsOpen')).toBe(true);
    instance.onClickActions();
    expect(wrapper.state('isActionsOpen')).toBe(false);
  });

  test('sets isActionOpen to false when calling onCloseActions', () => {
    const wrapper = shallow(<MonitorActions {...getProps()} />);
    const instance = wrapper.instance();
    expect(wrapper.state('isActionsOpen')).toBe(false);
    instance.onClickActions();
    expect(wrapper.state('isActionsOpen')).toBe(true);
    instance.onCloseActions();
    expect(wrapper.state('isActionsOpen')).toBe(false);
    instance.onCloseActions();
    expect(wrapper.state('isActionsOpen')).toBe(false);
  });
});

describe('MonitorActions', () => {
  let wrapper;
  let props;
  beforeEach(() => {
    props = getProps();
    wrapper = mount(<MonitorActions {...props} />);
  });
  afterEach(() => {
    wrapper.unmount();
  });

  test('toggles isActionOpen when Actions Edit button', () => {
    expect(wrapper.state('isActionsOpen')).toBe(false);
    wrapper
      .find('[data-test-subj="actionsButton"]')
      .hostNodes()
      .simulate('click');
    expect(wrapper.state('isActionsOpen')).toBe(true);
    wrapper
      .find('[data-test-subj="actionsButton"]')
      .hostNodes()
      .simulate('click');
    expect(wrapper.state('isActionsOpen')).toBe(false);
  });

  test('calls onCloseActions and onBulkAcknowledge when clicking Acknowledge item', () => {
    const instance = wrapper.instance();
    jest.spyOn(instance, 'onCloseActions');
    wrapper
      .find('[data-test-subj="actionsButton"]')
      .hostNodes()
      .simulate('click');
    wrapper
      .find('[data-test-subj="acknowledgeItem"]')
      .hostNodes()
      .simulate('click');
    expect(instance.onCloseActions).toHaveBeenCalledTimes(1);
    expect(props.onBulkAcknowledge).toHaveBeenCalledTimes(1);
  });

  test('calls onCloseActions and onBulkEnable when clicking Enable item', () => {
    const instance = wrapper.instance();
    jest.spyOn(instance, 'onCloseActions');
    wrapper
      .find('[data-test-subj="actionsButton"]')
      .hostNodes()
      .simulate('click');
    wrapper
      .find('[data-test-subj="enableItem"]')
      .hostNodes()
      .simulate('click');
    expect(instance.onCloseActions).toHaveBeenCalledTimes(1);
    expect(props.onBulkEnable).toHaveBeenCalledTimes(1);
  });

  test('calls onCloseActions and onBulkDisable when clicking Disable item', () => {
    const instance = wrapper.instance();
    jest.spyOn(instance, 'onCloseActions');
    wrapper
      .find('[data-test-subj="actionsButton"]')
      .hostNodes()
      .simulate('click');
    wrapper
      .find('[data-test-subj="disableItem"]')
      .hostNodes()
      .simulate('click');
    expect(instance.onCloseActions).toHaveBeenCalledTimes(1);
    expect(props.onBulkDisable).toHaveBeenCalledTimes(1);
  });

  test('calls onCloseActions and onBulkDelete when clicking Delete item', () => {
    const instance = wrapper.instance();
    jest.spyOn(instance, 'onCloseActions');
    wrapper
      .find('[data-test-subj="actionsButton"]')
      .hostNodes()
      .simulate('click');
    wrapper
      .find('[data-test-subj="deleteItem"]')
      .hostNodes()
      .simulate('click');
    expect(instance.onCloseActions).toHaveBeenCalledTimes(1);
    expect(props.onBulkDelete).toHaveBeenCalledTimes(1);
  });

  test('does not call onClickEdit when Edit is clicked and edit is disabled', () => {
    wrapper
      .find('[data-test-subj="editButton"]')
      .hostNodes()
      .simulate('click');
    expect(props.onClickEdit).toHaveBeenCalledTimes(0);
  });

  test('calls onClickEdit when Edit is clicked and isEditDisabled=false', () => {
    const props = getProps();
    wrapper.setProps({ ...props, isEditDisabled: false });
    wrapper
      .find('[data-test-subj="editButton"]')
      .hostNodes()
      .simulate('click');
    expect(props.onClickEdit).toHaveBeenCalledTimes(1);
  });
});
