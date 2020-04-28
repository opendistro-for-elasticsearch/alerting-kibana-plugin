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

export const anomalyResultMapper = anomalyResults => {
  let resultData = {
    anomalies: [],
    featureData: {},
  };
  if (anomalyResults.length === 0) return resultData;
  //initialize features list.
  const firstAnomaly = anomalyResults[0];
  Object.values(firstAnomaly.featureData).forEach(feature => {
    resultData.featureData[feature.featureId] = [];
  });
  anomalyResults.forEach(({ featureData, ...rest }) => {
    resultData.anomalies.push({
      ...rest,
      anomalyGrade:
        rest.anomalyGrade != null && rest.anomalyGrade > 0
          ? Number.parseFloat(rest.anomalyGrade).toFixed(2)
          : 0,
      confidence:
        rest.anomalyGrade != null && rest.anomalyGrade > 0
          ? Number.parseFloat(rest.confidence).toFixed(2)
          : 0,
      plotTime: rest.dataStartTime + Math.floor((rest.dataEndTime - rest.dataStartTime) / 2),
    });
    featureData.forEach(feature => {
      resultData.featureData[feature.featureId].push({
        startTime: rest.dataStartTime,
        endTime: rest.dataEndTime,
        plotTime: rest.dataStartTime + Math.floor((rest.dataEndTime - rest.dataStartTime) / 2),
        data: feature.data,
      });
    });
  });
  return resultData;
};
