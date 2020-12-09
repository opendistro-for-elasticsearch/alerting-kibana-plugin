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

import _ from 'lodash';
import { INDEX, MAX_THROTTLE_VALUE, WRONG_THROTTLE_WARNING } from '../../utils/constants';

// TODO: Use a validation framework to clean all of this up or create own.

export const isInvalid = (name, form) =>
  !!_.get(form.touched, name, false) && !!_.get(form.errors, name, false);

export const hasError = (name, form) => _.get(form.errors, name);

export const validateActionName = (trigger) => (value) => {
  if (!value) return 'Required';
  const matches = trigger.actions.filter((action) => action.name === value);
  if (matches.length > 1) return 'Action name is already used';
};

export const isInvalidActionThrottle = (action) => {
  if (_.get(action, 'throttle_enabled')) {
    var value = _.get(action, 'throttle.value');
    if (!value || value < 1 || value > MAX_THROTTLE_VALUE) {
      return true;
    }
  }
  return false;
};

export const validateActionThrottle = (action) => (value) => {
  if (isInvalidActionThrottle(action)) {
    return WRONG_THROTTLE_WARNING;
  }
};

export const required = (value) => {
  if (!value) return 'Required';
};

export const validateMonitorName = (httpClient, monitorToEdit) => async (value) => {
  try {
    if (!value) throw 'Required';
    const options = {
      index: INDEX.SCHEDULED_JOBS,
      query: { query: { term: { 'monitor.name.keyword': value } } },
    };
    const response = await httpClient.post('../api/alerting/monitors/_search', {
      body: JSON.stringify(options),
    });
    if (!response.ok) {
      // TODO: 'response.ok' is 'false' when there is no alerting config index in the cluster, and notification should not be shown to new Alerting users
      // backendErrorNotification(notifications, 'validate', 'monitor name', response);
      // throw 'To create the monitor, contact your administrator to obtain the following required permission for at least one of your Security role(s): cluster:admin/opendistro/alerting/monitor/search';
    } else if (_.get(response, 'resp.hits.total.value', 0)) {
      if (!monitorToEdit) throw 'Monitor name is already used';
      if (monitorToEdit && monitorToEdit.name !== value) {
        throw 'Monitor name is already used';
      }
    }
  } catch (err) {
    if (typeof err === 'string') throw err;
    throw 'There was a problem validating monitor name. Please try again.';
  }
};

export const validateTimezone = (value) => {
  if (!Array.isArray(value)) return 'Required';
  if (!value.length) return 'Required';
};

export const validatePositiveInteger = (value) => {
  if (!Number.isInteger(value) || value < 1) return 'Must be a positive integer';
};

export const validateUnit = (value) => {
  if (!['MINUTES', 'HOURS', 'DAYS'].includes(value)) return 'Must be one of minutes, hours, days';
};

export const validateMonthlyDay = (value) => {
  if (!Number.isInteger(value) || value < 1 || value > 31)
    return 'Must be a positive integer between 1-31';
};

export const ILLEGAL_CHARACTERS = ['\\', '/', '?', '"', '<', '>', '|', ',', ' '];

export const validateDetector = (detectorId, selectedDetector) => {
  if (!detectorId) return 'Must select detector';
  if (selectedDetector && selectedDetector.features.length === 0)
    return 'Must choose detector which has features';
};

export const validateIndex = (options) => {
  if (!Array.isArray(options)) return 'Must specify an index';
  if (!options.length) return 'Must specify an index';

  const illegalCharacters = ILLEGAL_CHARACTERS.join(' ');
  const pattern = options.map(({ label }) => label).join('');
  if (!isIndexPatternQueryValid(pattern, ILLEGAL_CHARACTERS)) {
    return `One of your inputs contains invalid characters or spaces. Please omit: ${illegalCharacters}`;
  }
};

export function isIndexPatternQueryValid(pattern, illegalCharacters) {
  if (!pattern || !pattern.length) {
    return false;
  }

  if (pattern === '.' || pattern === '..') {
    return false;
  }

  return !illegalCharacters.some((char) => pattern.includes(char));
}

export function validateExtractionQuery(value) {
  try {
    JSON.parse(value);
  } catch (err) {
    return 'Invalid JSON';
  }
}
