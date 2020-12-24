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
import PropTypes from 'prop-types';
import { EuiText, EuiSpacer } from '@elastic/eui';
import {
  Chart,
  Axis,
  LineSeries,
  niceTimeFormatter,
  Settings,
  Position,
  LineAnnotation,
} from '@elastic/charts';
import { ChartContainer } from '../../../../../components/ChartContainer/ChartContainer';
import DelayedLoader from '../../../../../components/DelayedLoader';

export const MAX_DATA_POINTS = 1000;

const getAxisTitle = (displayGrade, displayConfidence) => {
  if (displayGrade && displayConfidence) {
    return 'Anomaly grade / confidence';
  }
  return displayGrade ? 'Anomaly grade' : 'Anomaly confidence';
};

/**
 * In case of too many anomalies (e.g., high-cardinality detectors), we only keep the max anomalies within
 * allowed range.  Otherwise, return data as they are.
 * @param {any[]} data The original anomaly result from preview
 * @returns {any[]} anomalies within allowed range
 */
export const prepareDataForChart = (data) => {
  if (data && data.length > MAX_DATA_POINTS) {
    return sampleMaxAnomalyGrade(data);
  } else {
    return data;
  }
};

/**
 * Caclulate the stride between each step
 * @param {number} total Total number of preview results
 * @returns {number} The stride
 */
const calculateStep = (total) => {
  return Math.ceil(total / MAX_DATA_POINTS);
};

/**
 * Pick the elememtn with the max anomaly grade within the input array
 * @param {any[]} anomalies Input array with preview results
 * @returns The elememtn with the max anomaly grade
 */
const findAnomalyWithMaxAnomalyGrade = (anomalies) => {
  let anomalyWithMaxGrade = anomalies[0];
  for (let i = 1; i < anomalies.length; i++) {
    if (anomalies[i].anomalyGrade > anomalyWithMaxGrade.anomalyGrade) {
      anomalyWithMaxGrade = anomalies[i];
    }
  }
  return anomalyWithMaxGrade;
};

/**
 * Sample max anomalies within allowed range
 * @param {any[]} data The original results from preview
 * @return {any[]} sampled anomalies
 */
const sampleMaxAnomalyGrade = (data) => {
  let sortedData = data.sort((a, b) => (a.plotTime > b.plotTime ? 1 : -1));
  const step = calculateStep(sortedData.length);
  let index = 0;
  const sampledAnomalies = [];
  while (index < sortedData.length) {
    const arr = sortedData.slice(index, index + step);
    sampledAnomalies.push(findAnomalyWithMaxAnomalyGrade(arr));
    index = index + step;
  }
  return sampledAnomalies;
};

const AnomaliesChart = (props) => {
  const timeFormatter = niceTimeFormatter([props.startDateTime, props.endDateTime]);
  const preparedAnomalies = prepareDataForChart(props.anomalies);

  return (
    <DelayedLoader isLoading={props.isLoading}>
      {(showLoader) => (
        <React.Fragment>
          {props.showTitle ? (
            <EuiText size="xs">
              <strong>{props.title}</strong>
            </EuiText>
          ) : null}
          <EuiSpacer size="s" />
          <div>
            <ChartContainer
              style={{ height: '300px', width: '100%', opacity: showLoader ? 0.2 : 1 }}
            >
              <Chart>
                {props.showSettings ? (
                  <Settings
                    showLegend
                    legendPosition={Position.Bottom}
                    showLegendDisplayValue={false}
                  />
                ) : null}
                <Axis id="bottom" position="bottom" tickFormat={timeFormatter} />
                <Axis
                  id="left"
                  title={getAxisTitle(props.displayGrade, props.displayConfidence)}
                  position="left"
                  domain={{ min: 0, max: 1 }}
                />
                {props.annotationData ? (
                  <LineAnnotation
                    annotationId="anomalyAnnotation"
                    domainType="yDomain"
                    dataValues={props.annotationData}
                    style={{
                      line: {
                        strokeWidth: 1.5,
                        stroke: '#f00',
                      },
                    }}
                  />
                ) : null}
                {props.displayGrade ? (
                  <LineSeries
                    id="Anomaly grade"
                    xScaleType="time"
                    yScaleType="linear"
                    xAccessor={'plotTime'}
                    yAccessors={['anomalyGrade']}
                    data={preparedAnomalies}
                  />
                ) : null}
                {props.displayConfidence ? (
                  <LineSeries
                    id="Confidence"
                    xScaleType="time"
                    yScaleType="linear"
                    xAccessor={'plotTime'}
                    yAccessors={['confidence']}
                    data={preparedAnomalies}
                  />
                ) : null}
              </Chart>
            </ChartContainer>
          </div>
        </React.Fragment>
      )}
    </DelayedLoader>
  );
};

AnomaliesChart.propTypes = {
  startDateTime: PropTypes.number,
  endDateTime: PropTypes.number,
  endDate: PropTypes.number,
  isLoading: PropTypes.bool,
  showTitle: PropTypes.bool,
  showSettings: PropTypes.bool,
  annotationData: PropTypes.array,
  anomalies: PropTypes.array.isRequired,
  title: PropTypes.string,
};

AnomaliesChart.defaultProps = {
  isLoading: false,
  showTitle: true,
  showSettings: true,
  anomalies: undefined,
  title: 'Sample preview for anomaly score',
};

export { AnomaliesChart };
