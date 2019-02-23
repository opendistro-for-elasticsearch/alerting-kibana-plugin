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
import { render } from 'enzyme';

import MonitorOverview from './MonitorOverview';

describe('MonitorOverview', () => {
  test('renders', () => {
    const component = (
      <MonitorOverview
        monitor={{
          enabled: true,
          schedule: { period: { interval: 5, unit: 'MINUTES' } },
          ui_metadata: {
            search: { searchType: 'query' },
            schedule: {
              frequency: 'interval',
              period: { interval: 5, unit: 'MINUTES' },
            },
          },
        }}
        monitorVersion={3}
        dayCount={5}
        activeCount={17}
      />
    );

    expect(render(component)).toMatchSnapshot();
  });
});
