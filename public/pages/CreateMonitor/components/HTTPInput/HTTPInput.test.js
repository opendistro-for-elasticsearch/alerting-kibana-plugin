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
import { render } from 'enzyme';
import { Formik } from 'formik';

import HTTPInput from './HTTPInput';

// FIXME: This has an issue where EuiCodeEditor is generating a random HTML id and failing snapshot test
describe.skip('HTTPInput', () => {
  test('renders', () => {
    const component = (
      <Formik>
        <HTTPInput values={{ http: { urlType: 'url' }, searchType: 'http' }} />
      </Formik>
    );

    expect(render(component)).toMatchSnapshot();
  });
});
