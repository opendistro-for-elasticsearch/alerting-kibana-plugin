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
import POIChart from './POIChart';

const startTime = moment('2018-10-29T09:18:00');

const data = Array(5)
  .fill(1)
  .map((item, index) => ({
    x: startTime.add(2 * index + 1, 'm').valueOf(),
    y: 1 * index + 5,
  }));

describe('<POIChart/>', () => {
  test('renders', () => {
    expect(
      render(
        <POIChart
          highlightedArea={{
            startTime: moment('2018-10-29T09:28:00').valueOf(),
            endTime: moment('2018-10-29T09:30:00').valueOf(),
          }}
          data={data}
          onDragStart={() => {}}
          onDragEnd={() => {}}
          xDomain={[
            moment('2018-10-29T09:00:00').valueOf(),
            moment('2018-10-29T09:30:00').valueOf(),
          ]}
          yDomain={[0, 10]}
        />
      )
    ).toMatchSnapshot();
  });
});
