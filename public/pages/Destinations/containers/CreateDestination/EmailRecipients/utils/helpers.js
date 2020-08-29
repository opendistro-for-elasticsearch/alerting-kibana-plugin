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

export default async function getEmailGroups(searchText = '') {
  const { httpClient } = this.props;
  try {
    const response = await httpClient.get(
      `../api/alerting/email_groups?search=${searchText}&size=200`
    );
    if (response.data.ok) {
      return response.data.emailGroups;
    } else {
      console.log('Unable to get email groups', response.data.err);
      return [];
    }
  } catch (err) {
    console.log('Unable to get email groups', err);
    return [];
  }
}
