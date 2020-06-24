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
import { FORMIK_INITIAL_VALUES } from './constants';
import { customWebhookToFormik } from '../../../../Destinations/containers/CreateDestination/utils/destinationToFormik';

// Convert Monitor JSON to Formik values used in UI forms
export default function monitorToFormik(monitor) {
  const formikValues = _.cloneDeep(FORMIK_INITIAL_VALUES);
  if (!monitor) return formikValues;
  const {
    name,
    enabled,
    schedule: { cron: { expression: cronExpression = formikValues.cronExpression, timezone } = {} },
    inputs,
    ui_metadata: { schedule = {}, search = {} } = {},
  } = monitor;

  // TODO: handle 'searchType' condition that creating HTTP monitors through API
  // Default searchType to query, because if there is no ui_metadata or search then it was created through API or overwritten by API
  // In that case we don't want to guess on the UI what selections a user made, so we will default to just showing the extraction query
  const { searchType = 'query', fieldName } = search;
  const isAD = searchType === SEARCH_TYPE.AD;

  return {
    /* INITIALIZE WITH DEFAULTS */
    ...formikValues,

    /* CONFIGURE MONITOR */
    name,
    disabled: !enabled,

    /* This will overwrite the fields in use by Monitor from ui_metadata */
    ...schedule,
    cronExpression,

    /* DEFINE MONITOR */
    ...search,
    searchType,
    fieldName: fieldName ? [{ label: fieldName }] : [],
    timezone: timezone ? [{ label: timezone }] : [],

    detectorId: isAD ? _.get(inputs, INPUTS_DETECTOR_ID) : undefined,
    index: inputs[0].search.indices.map(index => ({ label: index })),
    query: JSON.stringify(inputs[0].search.query, null, 4),
    http: customWebhookToFormik(http),
  };
}
