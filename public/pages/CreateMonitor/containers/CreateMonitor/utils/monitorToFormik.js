/*
 *   Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
import { SEARCH_TYPE, INPUTS_DETECTOR_ID } from '../../../../../utils/constants';

// Convert Monitor JSON to Formik values used in UI forms
export default function monitorToFormik(monitor) {
  const formikValues = _.cloneDeep(FORMIK_INITIAL_VALUES);
  if (!monitor) return formikValues;
  const {
    name,
    monitor_type,
    enabled,
    schedule: { cron: { expression: cronExpression = formikValues.cronExpression, timezone } = {} },
    inputs,
    ui_metadata: { schedule = {}, search = {} } = {},
  } = monitor;
  // Default searchType to query, because if there is no ui_metadata or search then it was created through API or overwritten by API
  // In that case we don't want to guess on the UI what selections a user made, so we will default to just showing the extraction query
  let { searchType = 'query', fieldName } = search;
  if (_.isEmpty(search) && 'uri' in inputs[0]) searchType = SEARCH_TYPE.LOCAL_URI;
  const isAD = searchType === SEARCH_TYPE.AD;
  const isLocalUri = searchType === SEARCH_TYPE.LOCAL_URI;

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
    monitor_type,
    ...search,
    searchType,
    fieldName: fieldName ? [{ label: fieldName }] : [],
    timezone: timezone ? [{ label: timezone }] : [],

    detectorId: isAD ? _.get(inputs, INPUTS_DETECTOR_ID) : undefined,
    index: !isLocalUri ? inputs[0].search.indices.map((index) => ({ label: index })) : undefined,
    query: !isLocalUri ? JSON.stringify(inputs[0].search.query, null, 4) : undefined,
    uri: isLocalUri ? inputs[0].uri : undefined,
  };
}
