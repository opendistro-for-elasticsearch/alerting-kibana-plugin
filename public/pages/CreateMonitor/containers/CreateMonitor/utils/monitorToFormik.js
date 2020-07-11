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
import { SEARCH_TYPE, INPUTS_DETECTOR_ID } from '../../../../../utils/constants';
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

  // Default searchType to query, because if there is no ui_metadata or search then it was created through API or overwritten by API
  // In that case we don't want to guess on the UI what selections a user made, so we will default to just showing the extraction query
  let { searchType = 'query', fieldName } = search;
  // There is a new searchType - http, and can be created through API, this condition needs to be handled.
  if (_.isEmpty(search) && 'http' in inputs[0]) searchType = SEARCH_TYPE.HTTP;

  function inputsToFormik() {
    if (searchType === SEARCH_TYPE.HTTP) {
      return {
        http: customWebhookToFormik(inputs[0].http),
      };
    } else {
      const {
        search: { indices, query },
      } = inputs[0];
      if (searchType === SEARCH_TYPE.AD) {
        return {
          detectorId: _.get(inputs, INPUTS_DETECTOR_ID),
          index: indices.map((index) => ({ label: index })),
          query: JSON.stringify(query, null, 4),
        };
      } else {
        // when searchType is Query or Graph
        return {
          index: indices.map((index) => ({ label: index })),
          query: JSON.stringify(query, null, 4),
        };
      }
    }
  }

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

    ...inputsToFormik(),
  };
}
