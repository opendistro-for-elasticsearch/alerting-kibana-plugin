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
import { Formik } from 'formik';
import Message from './Message';
import Mustache from 'mustache';

jest.mock('@elastic/eui/lib/components/form/form_row/make_id', () => () => 'testing-id');

function getRenderWrapper(customProps = {}) {
  return render(
    <Formik>
      {() => (
        <Message
          action={{
            message_template: {
              source:
                'Monitor {{ctx.monitor.name}} just entered alert status. Please investigate the issue.\n- Trigger: {{ctx.trigger.name}}\n- Severity: {{ctx.trigger.severity}}\n- Period start: {{ctx.periodStart}}\n- Period end: {{ctx.periodEnd}}',
              lang: 'mustache',
            },
          }}
          context={{}}
          index={0}
          sendTestMessage={jest.fn()}
          setFlyout={jest.fn()}
        />
      )}
    </Formik>
  );
}

describe('Message', () => {
  test('renders', () => {
    const wrapper = getRenderWrapper();
    expect(wrapper).toMatchSnapshot();
  });
});
