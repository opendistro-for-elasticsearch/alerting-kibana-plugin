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

import {
  formikToGraphQuery,
  formikToUiGraphQuery,
  formikToIndices,
} from '../../CreateMonitor/utils/formikToMonitor';
import { SEARCH_TYPE } from '../../../../../utils/constants';

export const buildSearchRequest = (values, uiGraphQuery = true) => {
  console.log('#values in buildSearchRequest: ', values);
  switch (values.searchType) {
    case SEARCH_TYPE.QUERY:
      return buildQuerySearchRequest(values);
    case SEARCH_TYPE.GRAPH:
      return buildGraphSearchRequest(values, uiGraphQuery);
    case SEARCH_TYPE.HTTP:
      return buildHttpRequest(values);
  }
};

console.log('#entered search request');

function buildQuerySearchRequest(values) {
  const indices = formikToIndices(values);
  const query = JSON.parse(values.query);
  return { query, indices };
}

function buildGraphSearchRequest(values, uiGraphQuery) {
  const query = uiGraphQuery ? formikToUiGraphQuery(values) : formikToGraphQuery(values);
  const indices = formikToIndices(values);
  return { query, indices };
}

function buildHttpRequest(values) {
  const http = values.http;
  return http;
}
