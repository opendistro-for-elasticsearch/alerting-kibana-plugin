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
import { render, mount } from 'enzyme';
import { EuiExpression, EuiSelect } from '@elastic/eui';

import { FORMIK_INITIAL_VALUES } from '../../../containers/CreateMonitor/utils/constants';
import WhereExpression from './WhereExpression';
import { FormikFieldText, FormikFieldNumber } from '../../../../../components/FormControls';
import { OPERATORS_MAP } from './utils/constants';

const dataTypes = {
  integer: new Set(['age']),
  text: new Set(['cityName']),
  keyword: new Set(['cityName.keyword']),
};
const openExpression = jest.fn();
const closeExpression = jest.fn();
const getMountWrapper = (state = false) => (
  <Formik
    initialValues={FORMIK_INITIAL_VALUES}
    render={props => (
      <WhereExpression
        formik={props}
        dataTypes={dataTypes}
        openedStates={{ WHERE: state }}
        openExpression={openExpression}
        closeExpression={closeExpression}
        onMadeChanges={jest.fn()}
      />
    )}
  />
);

describe('WhereExpression', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('renders', () => {
    expect(render(getMountWrapper())).toMatchSnapshot();
  });
  test('calls openExpression when clicking expression', () => {
    const wrapper = mount(getMountWrapper());
    const button = wrapper.find(EuiExpression);
    button.simulate('click');
    wrapper.update();
    expect(openExpression).toHaveBeenCalled();
  });

  test('calls closeExpression when closing popover', () => {
    const wrapper = mount(getMountWrapper());
    const button = wrapper.find(EuiExpression);
    button.simulate('click');
    expect(openExpression).toHaveBeenCalled();
    button.simulate('keyDown', { keyCode: 27 });
    expect(closeExpression).toHaveBeenCalled();
  });
  test('should render text input for the text data types', () => {
    const wrapper = mount(getMountWrapper(true));
    wrapper
      .find('[data-test-subj="comboBoxSearchInput"]')
      .hostNodes()
      .simulate('change', { target: { value: 'cityName' } })
      .simulate('keyDown', { keyCode: 40 })
      .simulate('keyDown', { keyCode: 13 })
      .simulate('blur');

    wrapper.update();
    const values = wrapper.find(WhereExpression).props().formik.values;
    expect(values.where.fieldName).toEqual([{ label: 'cityName', type: 'text' }]);
    expect(values.where.operator).toEqual(OPERATORS_MAP.IS);
    expect(wrapper.find(FormikFieldText).length).toBe(1);
    expect(wrapper.find(FormikFieldNumber).length).toBe(0);
  });
});
