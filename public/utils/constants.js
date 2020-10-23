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

export const ALERT_STATE = Object.freeze({
  ACTIVE: 'ACTIVE',
  ACKNOWLEDGED: 'ACKNOWLEDGED',
  COMPLETED: 'COMPLETED',
  ERROR: 'ERROR',
  DELETED: 'DELETED',
});

export const DETECTOR_CREATION_CALLOUTS = {
  FILTER_QUERY_NO_RESULTS:
    'No Data is found with the current filter query used for the past ' +
    NUM_INTERVALS_FILTER_QUERY_CHECKED_AGAINST +
    ' intervals, you' +
    ' can try to manually change detector interval and still continue with validation' +
    ' however the data is most likely to be too sparse',
  MAX_INTERVAL:
    'No optimal detector interval was found with the current data source, (checked up to' +
    MAX_MINUTE_INTERVAL_LENGTH +
    ') you can still proceed with this detector creation however it will' +
    ' likely fail since the data is too sparse',
  NOT_VALID:
    'Please fix and validate any needed field in order to successfuly create an anomaly' +
    ' detector. Anomaly detection creation requires configurations that lead to enough data',
  VALID:
    'Anomaly detector configurations have been validated, click create detector to confirm creation',
};

export const MAX_MINUTE_INTERVAL_LENGTH = 10800;

export const NUM_INTERVALS_FILTER_QUERY_CHECKED_AGAINST = '384';

export const DEFAULT_EMPTY_DATA = '-';

export const APP_PATH = {
  CREATE_MONITOR: '/create-monitor',
  CREATE_DESTINATION: '/create-destination',
};

export const SEARCH_TYPE = {
  GRAPH: 'graph',
  QUERY: 'query',
  AD: 'ad',
};

export const DESTINATION_ACTIONS = {
  UPDATE_DESTINATION: 'update-destination',
};

export const MONITOR_ACTIONS = {
  UPDATE_MONITOR: 'update-monitor',
};

export const TRIGGER_ACTIONS = {
  UPDATE_TRIGGER: 'update-trigger',
  CREATE_TRIGGER: 'create-trigger',
};

export const DATA_TYPES = {
  NUMBER: 'number',
  TEXT: 'text',
  BOOLEAN: 'boolean',
  KEYWORD: 'keyword',
};

export const ES_AD_PLUGIN = 'opendistro-anomaly-detection';
export const KIBANA_AD_PLUGIN = 'opendistro-anomaly-detection-kibana';

export const INPUTS_DETECTOR_ID = '0.search.query.query.bool.filter[1].term.detector_id.value';

export const MONITOR_INPUT_DETECTOR_ID = `inputs.${INPUTS_DETECTOR_ID}`;

export const AD_PREVIEW_DAYS = 7;
