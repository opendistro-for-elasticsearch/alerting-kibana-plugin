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

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { get, isEqual } from 'lodash';
import { EuiHorizontalRule } from '@elastic/eui';
import moment from 'moment';

import ContentPanel from '../../../../components/ContentPanel';
import {
  TriggersTimeSeries,
  POIChart,
  Legend,
  EmptyHistory,
} from '../../components/MonitorHistory/';
import { calculateInterval } from './utils/timeUtils';
import DateRangePicker from './DateRangePicker';

import {
  generateFirstDataPoints,
  dataPointsGenerator,
  getPOISearchQuery,
} from './utils/chartHelpers';
import * as HistoryConstants from './utils/constants';
import { INDEX } from '../../../../../utils/constants';
import queryString from 'query-string';

class MonitorHistory extends PureComponent {
  constructor(props) {
    super(props);

    //TODO:: we might move this to DateRangePicker and make callback to update POIInterest? Check the perf and timings.
    this.initialStartTime = moment(Date.now())
      .subtract(HistoryConstants.DEFAULT_POI_TIME_WINDOW_DAYS, 'days')
      .startOf('day');
    this.initialEndTime = moment(Date.now());

    this.state = {
      poiData: [],
      triggersData: {},
      isLoading: true,
      maxAlerts: 0,
      timeSeriesWindow: {},
      poiTimeWindow: {
        startTime: this.initialStartTime,
        endTime: this.initialEndTime,
      },
    };
  }
  async componentDidMount() {
    const { triggers } = this.props;
    if (triggers.length > 0) {
      await this.getPOIData();
    }
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(this.props.triggers, prevProps.triggers)) {
      this.getPOIData();
    }
  }

  handleRangeChange = (startTime, endTime) => {
    this.setState({ poiTimeWindow: { startTime, endTime } }, () => this.getPOIData());
  };

  /* This will generate data points and returns array
    {
      x0: plotting starts from.
      x: plotting ends,
      meta: Any meta data
  */
  generatePlotData = (alertsData) => {
    const {
      timeSeriesWindow: { startTime: windowStartTime, endTime: windowEndTime },
    } = this.state;
    // In case of empty just return  start-end as not alerting state.
    if (alertsData.length === 0) {
      return [
        {
          x0: windowStartTime,
          x: windowEndTime,
          state: HistoryConstants.TIME_SERIES_ALERT_STATE.NO_ALERTS,
          meta: {
            startTime: windowStartTime,
            endTime: windowEndTime,
          },
        },
      ];
    }
    const [firstAlert, ...restAlerts] = alertsData;
    //handles first alert separately.
    const firstAlertDataPoints = generateFirstDataPoints({
      startTime: get(firstAlert, '_source.start_time'),
      acknowledgedTime: get(firstAlert, '_source.acknowledged_time'),
      endTime: get(firstAlert, '_source.end_time'),
      state: get(firstAlert, '_source.state'),
      windowStartTime,
      windowEndTime,
      errorsCount: get(firstAlert, '_source.alert_history.length', 0),
    });
    // Handle rest of the alerts
    let lastEndTime = get(firstAlert, '_source.end_time');

    const restAlertsDataPoints = restAlerts.reduce((acc, currentAlert) => {
      const {
        start_time: startTime,
        acknowledged_time: acknowledgedTime,
        end_time: currentEndTime,
        state,
        alert_history = [],
      } = currentAlert._source;
      acc.push(
        ...dataPointsGenerator(
          {
            startTime,
            acknowledgedTime,
            endTime: currentEndTime,
            lastEndTime,
            windowStartTime,
            windowEndTime,
            meta: {
              startTime,
              acknowledgedTime,
              endTime: currentEndTime,
              state,
              errorsCount: alert_history.length,
            },
          },
          lastEndTime
        )
      );
      lastEndTime = currentEndTime;
      return acc;
    }, []);

    // Handle last data point if required.
    const lastAlertDataPoint = [];
    if (lastEndTime && lastEndTime < windowEndTime) {
      lastAlertDataPoint.push({
        x0: lastEndTime,
        x: windowEndTime,
        state: HistoryConstants.TIME_SERIES_ALERT_STATE.NO_ALERTS,
        meta: {
          startTime: lastEndTime,
          endTime: windowEndTime,
        },
      });
    }
    return [...firstAlertDataPoints, ...restAlertsDataPoints, ...lastAlertDataPoint];
  };

  getWindowSize = (poiData, intervalDuration) => {
    /*
      brushAreaStart Duration is to defined the start point for smaller window over zoomer
      on which time line will be displayed. Duration will default to what interval has been
      computed to ES bucket in case it is too small,
      just scale it so that customer can have better experience
    */
    const {
      poiTimeWindow: { endTime },
    } = this.state;
    const brushAreaStartDuration =
      intervalDuration.asMinutes() < 10
        ? moment.duration(HistoryConstants.MIN_HIGHLIGHT_WINDOW_DURATION, 'm')
        : intervalDuration;
    return {
      startTime: endTime.valueOf() - brushAreaStartDuration.asMilliseconds(),
      endTime: endTime.valueOf(),
    };
  };

  getPOIData = async () => {
    const { httpClient, monitorId } = this.props;
    const { poiTimeWindow } = this.state;
    const intervalDuration = calculateInterval(
      moment.duration(poiTimeWindow.endTime - poiTimeWindow.startTime, 'ms')
    );

    try {
      const requestBody = {
        query: getPOISearchQuery(
          monitorId,
          poiTimeWindow.startTime.valueOf(),
          poiTimeWindow.endTime.valueOf(),
          intervalDuration
        ),
        index: INDEX.ALL_ALERTS,
      };
      const resp = await httpClient.post('../api/alerting/monitors/_search', {
        body: JSON.stringify(requestBody),
      });
      if (resp.ok) {
        const poiData = get(resp, 'resp.aggregations.alerts_over_time.buckets', []).map((item) => ({
          x: item.key,
          y: item.doc_count,
        }));
        this.setState(
          {
            poiData,
            maxAlerts: get(resp, 'resp.aggregations.max_alerts.value', 0),
            timeSeriesWindow: {
              ...this.getWindowSize(poiData, intervalDuration),
            },
          },
          () => this.getAlerts()
        );
      } else {
        const parsedError = JSON.parse(resp.resp.response);
        this.setState({ queryResponse: parsedError });
      }
    } catch (err) {
      //TODO:: Handle Errors Gracefully.
      console.log('err', err);
    }
  };

  getAlerts = async () => {
    this.setState({
      isLoading: true,
    });
    const { timeSeriesWindow } = this.state;
    const { httpClient, triggers, monitorId } = this.props;
    try {
      const params = {
        size: HistoryConstants.MAX_DOC_COUNT_FOR_ALERTS,
        sortField: 'start_time',
        sortDirection: 'asc',
        monitorIds: monitorId,
      };

      const resp = await httpClient.get('../api/alerting/alerts', { query: params });
      var alerts;
      if (resp.ok) {
        alerts = resp.alerts;
      } else {
        console.log('error getting alerts:', resp);
        alerts = [];
      }

      const triggerTemp = {};
      alerts.forEach((alert) => {
        if (
          alert.start_time <= timeSeriesWindow.endTime &&
          (alert.end_time == null || alert.end_time >= timeSeriesWindow.startTime)
        ) {
          if (!(alert.trigger_id in triggerTemp)) {
            triggerTemp[alert.trigger_id] = [];
          }
          triggerTemp[alert.trigger_id].push({ _source: alert });
        }
      });

      const triggersData = {};
      triggers.forEach((trigger) => {
        triggersData[trigger.id] = this.generatePlotData(get(triggerTemp, trigger.id, []));
      });

      this.setState({
        isLoading: false,
        triggersData,
        prevTimeSeriesWindow: timeSeriesWindow,
      });
    } catch (err) {
      //TODO:: Handle Errors Gracefully.
      console.log('err', err);
    }
  };

  handleDragEnd = (area) => {
    const { timeSeriesWindow } = this.state;
    if ((area && area.left.getTime() === timeSeriesWindow.startTime) || this.state.isLoading)
      return;
    this.setState(
      {
        prevTimeSeriesWindow: timeSeriesWindow,
        timeSeriesWindow: {
          startTime: area.left.getTime(),
          endTime: area.right.getTime(),
        },
      },
      () => this.getAlerts()
    );
  };
  render() {
    const {
      poiData,
      timeSeriesWindow,
      isLoading,
      triggersData,
      poiTimeWindow,
      maxAlerts,
      prevTimeSeriesWindow,
    } = this.state;
    const { triggers, onShowTrigger } = this.props;
    return (
      <ContentPanel
        title="History"
        titleSize="s"
        bodyStyles={{ minHeight: 200, padding: 0 }}
        actions={[
          <DateRangePicker
            initialStartTime={this.initialStartTime}
            initialEndTime={this.initialEndTime}
            onRangeChange={this.handleRangeChange}
          />,
        ]}
      >
        {triggers.length > 0 ? (
          <React.Fragment>
            <TriggersTimeSeries
              triggers={triggers}
              isLoading={isLoading}
              triggersData={triggersData}
              domainBounds={prevTimeSeriesWindow || timeSeriesWindow}
            />
            <POIChart
              isLoading={isLoading}
              data={poiData}
              onDragStart={() => this.setState({ loading: false })}
              highlightedArea={timeSeriesWindow}
              onDragEnd={this.handleDragEnd}
              xDomain={[poiTimeWindow.startTime, poiTimeWindow.endTime]}
              yDomain={[
                0,
                maxAlerts <= HistoryConstants.MIN_POI_Y_SCALE
                  ? HistoryConstants.MIN_POI_Y_SCALE
                  : maxAlerts,
              ]}
              isDarkMode={this.props.isDarkMode}
            />
            <EuiHorizontalRule margin="xs" />
            <Legend />
          </React.Fragment>
        ) : (
          <EmptyHistory onShowTrigger={onShowTrigger} />
        )}
      </ContentPanel>
    );
  }
}

MonitorHistory.propTypes = {
  triggers: PropTypes.array.isRequired,
  onShowTrigger: PropTypes.func.isRequired,
};

export default MonitorHistory;
