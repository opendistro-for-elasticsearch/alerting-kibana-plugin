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
import moment from 'moment';
import { render } from 'enzyme';
import TriggersTimeSeries from './TriggersTimeSeries';

describe('<TriggersTimeSeries/>', () => {
  test('renders', () => {
    expect(
      render(
        <TriggersTimeSeries
          triggers={[{ id: '1', name: 'Trigger 1' }]}
          triggersData={{
            '1': [
              {
                x0: moment('2018-10-29T09:00:00').valueOf(),
                x: moment('2018-10-29T09:15:00').valueOf(),
                state: 'NO_ALERTS',
                meta: {
                  state: '',
                },
              },
              {
                x0: moment('2018-10-29T09:15:00').valueOf(),
                x: moment('2018-10-29T09:18:00').valueOf(),
                state: 'TRIGGERED',
                meta: {
                  state: '',
                },
              },
              {
                x0: moment('2018-10-29T09:18:00').valueOf(),
                x: moment('2018-10-29T09:30:00').valueOf(),
                state: 'NO_ALERTS',
                meta: {
                  state: '',
                },
              },
            ],
          }}
          domainBounds={{
            startTime: moment('2018-10-29T09:00:00').valueOf(),
            endTime: moment('2018-10-29T09:30:00').valueOf(),
          }}
        />
      )
    ).toMatchSnapshot();
  });
});
