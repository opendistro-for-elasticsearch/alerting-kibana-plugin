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

import _ from 'lodash';
import { ALLOW_LIST_SETTING_PATH } from './constants';

export async function getAllowList(httpClient) {
  try {
    const response = await httpClient.get('../api/alerting/_settings');
    if (response.ok) {
      // Attempt to resolve the value of allow_list in the order of 'persistent, 'transient' and 'defaults' settings
      const { defaults, transient, persistent } = response.resp;
      const defaultList = _.get(defaults, `${ALLOW_LIST_SETTING_PATH}`, []);
      const transientList = _.get(transient, `${ALLOW_LIST_SETTING_PATH}`, null);
      const persistentList = _.get(persistent, `${ALLOW_LIST_SETTING_PATH}`, null);

      return persistentList || transientList || defaultList;
    } else {
      console.log('Unable to get destination allow_list', response.resp);
      return [];
    }
  } catch (err) {
    console.log('Unable to get destination allow_list', err);
    return [];
  }
}
