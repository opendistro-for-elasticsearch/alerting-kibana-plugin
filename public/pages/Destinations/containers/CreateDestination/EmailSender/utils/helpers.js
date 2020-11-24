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

import { MAX_QUERY_RESULT_SIZE } from '../../../../../../utils/constants';

export default async function getSenders(httpClient, searchText = '') {
  try {
    const response = await httpClient.get('../api/alerting/destinations/email_accounts', {
      query: { search: searchText, size: MAX_QUERY_RESULT_SIZE },
    });
    if (response.ok) {
      return response.emailAccounts;
    } else {
      console.log('Unable to get email accounts', response.err);
      return [];
    }
  } catch (err) {
    console.log('Unable to get email accounts', err);
    return [];
  }
}
