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
import { AnomaliesChart, MAX_DATA_POINTS, prepareDataForChart } from './AnomaliesChart';

const startTime = moment('2018-10-25T09:30:00').valueOf();
const endTime = moment('2018-10-29T09:30:00').valueOf();

const getRandomArbitrary = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min);
};

/**
 * Generate preview results
 * @param {Number} startTime Preview start time in epoch milliseconds
 * @param {Number} endTime Preview end time in epoch milliseconds
 * @param {Number} count Number of results
 * @returns {any[]} Generated results
 */
const createTestData = (startTime, endTime, count) => {
  const data = [];
  const interval = 60000;
  const midInterval = interval / 2;
  for (let i = 0; i < count - 3; i++) {
    let startGenerated = getRandomArbitrary(startTime, endTime);
    data.push({
      anomalyGrade: 0,
      confidence: 0,
      dataEndTime: startGenerated + interval,
      dataStartTime: startGenerated,
      detectorId: 'nxEuT3YBdrEXnzbxJ7XZ',
      plotTime: startGenerated + midInterval,
      schemaVersion: 0,
    });
  }
  // injected 3 anomalies: the beginning, the end, and the middle.
  data.push({
    anomalyGrade: 1,
    confidence: 0.7,
    dataEndTime: startTime + interval,
    dataStartTime: startTime,
    detectorId: 'nxEuT3YBdrEXnzbxJ7XZ',
    plotTime: startTime + midInterval,
    schemaVersion: 0,
  });

  data.push({
    anomalyGrade: 0.9,
    confidence: 0.8,
    dataEndTime: endTime,
    dataStartTime: endTime - interval,
    detectorId: 'nxEuT3YBdrEXnzbxJ7XZ',
    plotTime: endTime - interval + midInterval,
    schemaVersion: 0,
  });

  let mid = startTime + (endTime - startTime) / 2;
  data.push({
    anomalyGrade: 0.7,
    confidence: 0.9,
    dataEndTime: mid + interval,
    dataStartTime: mid,
    detectorId: 'nxEuT3YBdrEXnzbxJ7XZ',
    plotTime: mid + midInterval,
    schemaVersion: 0,
  });

  return data;
};

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

  test('hc detector trigger definition', () => {
    let startTime = 1608327992253;
    let endTime = 1608759992253;
    const preparedAnomalies = prepareDataForChart(
      createTestData(startTime, endTime, MAX_DATA_POINTS * 30)
    );

    expect(preparedAnomalies.length).toBeCloseTo(MAX_DATA_POINTS);

    expect(preparedAnomalies[MAX_DATA_POINTS - 1].anomalyGrade).toBeCloseTo(0.9);
    expect(preparedAnomalies[MAX_DATA_POINTS - 1].confidence).toBeCloseTo(0.8);

    var anomalyNumber = 0;
    for (let i = 0; i < MAX_DATA_POINTS; i++) {
      if (preparedAnomalies[i].anomalyGrade > 0) {
        anomalyNumber++;
        // we injected an anomaly in the middle.  Due to randomness, we cannot predict which one it is.
        if (i > 0 && i < MAX_DATA_POINTS - 1) {
          expect(preparedAnomalies[i].anomalyGrade).toBeCloseTo(0.7);
          expect(preparedAnomalies[i].confidence).toBeCloseTo(0.9);
        }
      }
    }
    // injected 3 anomalies
    expect(anomalyNumber).toBe(3);
  });

  test('single-stream detector trigger definition', () => {
    let startTime = 1608327992253;
    let endTime = 1608759992253;

    let originalPreviewResults = createTestData(startTime, endTime, MAX_DATA_POINTS);
    // we only consolidate and reduce original data when the input data size is larger than MAX_DATA_POINTS
    expect(prepareDataForChart(originalPreviewResults)).toBe(originalPreviewResults);
  });
});
