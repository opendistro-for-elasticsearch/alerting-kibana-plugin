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
  getAxisId,
  Axis,
  getSpecId,
  LineSeries,
  niceTimeFormatter,
  Settings,
  Position,
  getAnnotationId,
  LineAnnotation,
} from '@elastic/charts';
import { ChartContainer } from '../../../../../components/ChartContainer/ChartContainer';
import DelayedLoader from '../../../../../components/DelayedLoader';

const getAxisTitle = (displayGrade, displayConfidence) => {
  if (displayGrade && displayConfidence) {
    return 'Anomaly grade / confidence';
  }
  return displayGrade ? 'Anomaly grade' : 'Anomaly confidence';
};

const AnomaliesChart = props => {
  const timeFormatter = niceTimeFormatter([props.startDateTime, props.endDateTime]);
  return (
    <DelayedLoader isLoading={props.isLoading}>
      {showLoader => (
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
                <Axis id={getAxisId('bottom')} position="bottom" tickFormat={timeFormatter} />
                <Axis
                  id={getAxisId('left')}
                  title={getAxisTitle(props.displayGrade, props.displayConfidence)}
                  position="left"
                  domain={{ min: 0, max: 1 }}
                />
                {props.annotationData ? (
                  <LineAnnotation
                    annotationId={getAnnotationId('anomalyAnnotation')}
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
                    id={getSpecId('Anomaly grade')}
                    xScaleType="time"
                    yScaleType="linear"
                    xAccessor={'plotTime'}
                    yAccessors={['anomalyGrade']}
                    data={props.anomalies}
                  />
                ) : null}
                {props.displayConfidence ? (
                  <LineSeries
                    id={getSpecId('Confidence')}
                    xScaleType="time"
                    yScaleType="linear"
                    xAccessor={'plotTime'}
                    yAccessors={['confidence']}
                    data={props.anomalies}
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
