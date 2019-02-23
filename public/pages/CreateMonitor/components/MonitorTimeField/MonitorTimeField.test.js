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
import { render, mount } from 'enzyme';
import { Formik } from 'formik';

import MonitorTimeField from './MonitorTimeField';

describe('MonitorTimeField', () => {
  test.skip('renders', () => {
    const component = (
      <Formik initialValues={{}} onSubmit={() => {}}>
        <MonitorTimeField dataTypes={{}} />
      </Formik>
    );

    expect(render(component)).toMatchSnapshot();
  });

  test.skip('displays no options', () => {
    const wrapper = mount(
      <Formik initialValues={{}} onSubmit={() => {}}>
        <MonitorTimeField dataTypes={{}} />
      </Formik>
    );
    // Default blank option
    expect(wrapper.find('select').props().children[1].length).toBe(1);
  });

  test.skip('displays options', () => {
    const wrapper = mount(
      <Formik initialValues={{}} onSubmit={() => {}}>
        <MonitorTimeField dataTypes={{ date: ['date1', 'date2', 'date3'] }} />
      </Formik>
    );
    // 3 options + default blank option
    expect(wrapper.find('select').props().children[1].length).toBe(4);
  });
});
