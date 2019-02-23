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
import { render } from 'enzyme';

import { FORMIK_INITIAL_VALUES } from '../../../containers/CreateMonitor/utils/constants';
import Frequency from './Frequency';
import Interval from './Interval';
import Monthly from './Monthly';
import CustomCron from './CustomCron';
import FrequencyPicker from './FrequencyPicker';

describe('Frequencies', () => {
  test('renders Frequency', () => {
    const component = <Formik initialValues={FORMIK_INITIAL_VALUES} render={() => <Frequency />} />;

    expect(render(component)).toMatchSnapshot();
  });

  test('renders Interval', () => {
    const component = <Formik initialValues={FORMIK_INITIAL_VALUES} render={() => <Interval />} />;

    expect(render(component)).toMatchSnapshot();
  });

  test.skip('renders Monthly', () => {
    const component = <Formik initialValues={FORMIK_INITIAL_VALUES} render={() => <Monthly />} />;

    expect(render(component)).toMatchSnapshot();
  });

  test('renders CustomCron', () => {
    const component = (
      <Formik initialValues={FORMIK_INITIAL_VALUES} render={() => <CustomCron />} />
    );

    expect(render(component)).toMatchSnapshot();
  });

  test('renders FrequencyPicker', () => {
    const component = (
      <Formik initialValues={FORMIK_INITIAL_VALUES} render={() => <FrequencyPicker />} />
    );

    expect(render(component)).toMatchSnapshot();
  });
});
