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
    if (response.data.ok) {
      // Attempt to resolve the value of allow_list in the order of 'transient, 'persistent' and 'defaults' settings
      let allowList = _.get(
        response.data.resp,
        `transient.${ALLOW_LIST_SETTING_PATH}`,
        'transient_not_found'
      );
      if (allowList === 'transient_not_found') {
        allowList = _.get(
          response.data.resp,
          `persistent.${ALLOW_LIST_SETTING_PATH}`,
          'persistent_not_found'
        );
      }
      if (allowList === 'persistent_not_found') {
        allowList = _.get(response.data.resp, `defaults.${ALLOW_LIST_SETTING_PATH}`, []);
      }

      return allowList;
    } else {
      console.log('Unable to get destination allow_list', response.data.resp);
      return [];
    }
  } catch (err) {
    console.log('Unable to get destination allow_list', err);
    return [];
  }
}
