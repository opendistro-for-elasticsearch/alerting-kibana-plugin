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
import moment from 'moment';
import { AnomaliesChart } from './AnomaliesChart';

const startTime = moment('2018-10-25T09:30:00').valueOf();
const endTime = moment('2018-10-29T09:30:00').valueOf();

describe('AnomaliesChart', () => {
  test('renders ', () => {
    const sampleData = [
      {
        anomalyGrade: 0.9983687181753063,
        anomalyScore: 0.8381447468893426,
        confidence: 0.42865659282252266,
        detectorId: 'temp',
        endTime: 1569097677667,
        plotTime: 1569097377667,
        startTime: 1569097077667,
      },
    ];
    const component = (
      <AnomaliesChart
        anomalies={sampleData}
        startDateTime={startTime}
        endDateTime={endTime}
        isLoading={false}
        displayGrade
        displayConfidence
        showTitle
      />
    );
    expect(render(component)).toMatchSnapshot();
  });
});
