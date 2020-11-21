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
import { INDEX } from '../../../../../../utils/constants';
import { getAllowList } from '../../../utils/helpers';

export const validateDestinationName = (httpClient, destinationToEdit) => async (value) => {
  try {
    if (!value) throw 'Required';
    const options = {
      index: INDEX.SCHEDULED_JOBS,
      query: { query: { term: { 'destination.name.keyword': value } } },
    };
    const response = await httpClient.post('../api/alerting/monitors/_search', {
      body: JSON.stringify(options),
    });
    if (_.get(response, 'resp.hits.total.value', 0)) {
      if (!destinationToEdit) throw 'Destination name is already used';
      if (destinationToEdit && destinationToEdit.name !== value) {
        throw 'Destination name is already used';
      }
    }
  } catch (err) {
    if (typeof err === 'string') throw err;
    throw 'There was a problem validating destination name. Please try again.';
  }
};

export const validateDestinationType = (httpClient) => async (value) => {
  // Check if Destination type is allowed to notify users in the cases
  // where a Destination type has been disallowed during form editing
  const allowList = await getAllowList(httpClient);
  if (!allowList.includes(value)) {
    return `Destination type [${value}] is disallowed`;
  }
};
