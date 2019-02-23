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

export const TIME_SERIES_ALERT_STATE = Object.freeze({
  NO_ALERTS: 'NO_ALERTS',
  TRIGGERED: 'TRIGGERED',
  ACKNOWLEDGED: 'ACKNOWLEDGED',
  ERROR: 'ERROR',
});

export const ALERT_TIMELINE_COLORS_MAP = {
  [TIME_SERIES_ALERT_STATE.NO_ALERTS]: '#6AAF35',
  [TIME_SERIES_ALERT_STATE.TRIGGERED]: '#D0021B',
  [TIME_SERIES_ALERT_STATE.ACKNOWLEDGED]: 'pink',
  [TIME_SERIES_ALERT_STATE.ERROR]: 'lightgrey',
};

// Maximum days allowed for date range
export const MAX_DAYS_ALLOWED_IN_RANGE = 30;

// Default time window for Range
export const DEFAULT_POI_TIME_WINDOW_DAYS = 2;

export const MAX_DOC_COUNT_FOR_ALERTS = 800;

//Minimum Highlight Window if range is too small.
export const MIN_POI_Y_SCALE = 5;

// This is in Minutes
export const MIN_HIGHLIGHT_WINDOW_DURATION = 10;
