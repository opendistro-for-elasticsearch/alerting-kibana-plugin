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
import { mount, shallow } from 'enzyme';
import { EuiExpression } from '@elastic/eui';
import { Formik } from 'formik';

import TriggerExpressions, { Expressions } from './TriggerExpressions';

const props = {
  thresholdEnum: 'ABOVE',
  thresholdValue: 500,
};

describe('TriggerExpressions', () => {
  test('renders', () => {
    const wrapper = shallow(<TriggerExpressions {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  test('calls openExpression when clicking expression', () => {
    const wrapper = mount(<Formik render={() => <TriggerExpressions {...props} />} />);
    const openExpression = jest.spyOn(
      wrapper.find(TriggerExpressions).instance(),
      'openExpression'
    );
    const button = wrapper.find(EuiExpression);
    expect(wrapper.find(TriggerExpressions).state().openedStates[Expressions.THRESHOLD]).toBe(
      false
    );
    button.simulate('click');
    wrapper.update();
    expect(openExpression).toHaveBeenCalled();
    expect(wrapper.find(TriggerExpressions).state().openedStates[Expressions.THRESHOLD]).toBe(true);
  });

  test('calls closeExpression when closing popover', async () => {
    const wrapper = mount(<Formik render={() => <TriggerExpressions {...props} />} />);
    const openExpression = jest.spyOn(
      wrapper.find(TriggerExpressions).instance(),
      'openExpression'
    );
    const closeExpression = jest.spyOn(
      wrapper.find(TriggerExpressions).instance(),
      'closeExpression'
    );
    const button = wrapper.find(EuiExpression);
    button.simulate('click');
    wrapper.update();
    expect(openExpression).toHaveBeenCalled();
    expect(wrapper.find(TriggerExpressions).state().openedStates[Expressions.THRESHOLD]).toBe(true);
    await new Promise((res) => setTimeout(() => res()));
    button.simulate('keyDown', { keyCode: 27 });
    wrapper.update();
    expect(closeExpression).toHaveBeenCalled();
    expect(wrapper.find(TriggerExpressions).state().openedStates[Expressions.THRESHOLD]).toBe(
      false
    );
  });
});
