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

const getRandomInt = () => Math.floor(Math.random() * 10) + 1;

export const generatePOIData = (startTime) =>
  Array(96) // 2 Days duration with 30 mins interval
    .fill(0)
    .map((item) => ({
      key: startTime.add(30, 'm').valueOf(),
      doc_count: getRandomInt(),
    }));

export const getPOIResponse = (initialStartTime) => {
  const histogramBucketsData = generatePOIData(initialStartTime);
  return {
    data: {
      ok: true,
      resp: {
        aggregations: {
          alerts_over_time: { buckets: histogramBucketsData },
          max_alerts: {
            value: Math.max(...histogramBucketsData.map((datapoint) => datapoint.doc_count)),
          },
        },
      },
    },
  };
};

export const getAlertsResponse = (
  triggerId,
  triggerName,
  monitorId,
  monitorName,
  windowStartTime
) => {
  const initialStartTime = windowStartTime;
  return {
    trigger_id: triggerId,
    trigger_name: triggerName,
    monitor_id: monitorId,
    monitor_name: monitorName,
    start_time: initialStartTime.add(5, 'm').valueOf(),
    end_time: initialStartTime.add(3, 'm').valueOf(),
    state: 'COMPLETED',
  };
};
