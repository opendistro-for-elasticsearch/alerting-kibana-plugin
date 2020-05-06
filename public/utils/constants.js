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

export const ALERT_STATE = Object.freeze({
  ACTIVE: 'ACTIVE',
  ACKNOWLEDGED: 'ACKNOWLEDGED',
  COMPLETED: 'COMPLETED',
  ERROR: 'ERROR',
  DELETED: 'DELETED',
});

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
