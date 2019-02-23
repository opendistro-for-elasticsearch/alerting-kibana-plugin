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

import { DESTINATION_OPTIONS } from '../../../utils/constants';

export const DEFAULT_QUERY_PARAMS = {
  from: 0,
  search: '',
  size: 20,
  sortDirection: 'desc',
  sortField: 'name',
  type: 'ALL',
};

export const MAX_DESTINATIONS = 200;

export const staticColumns = [
  {
    field: 'name',
    name: 'Destination name',
    sortable: true,
    truncateText: true,
    textOnly: true,
    width: '100px',
  },
  {
    field: 'type',
    name: 'Destination type',
    truncateText: true,
    sortable: true,
    textOnly: true,
    width: '100px',
    render: value => {
      //TODO:: Convert this to proper map of text to avoid filters always
      const actionType = DESTINATION_OPTIONS.filter(item => item.value === value);
      if (actionType.length > 0) {
        return actionType[0].text;
      } else {
        return 'Unsupported Type';
      }
    },
  },
];
