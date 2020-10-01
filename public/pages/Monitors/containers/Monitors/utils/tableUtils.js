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

import React from 'react';
import { EuiLink } from '@elastic/eui';
import moment from 'moment';
import { DEFAULT_EMPTY_DATA } from '../../../../../utils/constants';
import { PLUGIN_NAME } from '../../../../../../utils/constants';

const renderTime = (time) => {
  const momentTime = moment(time);
  if (time && momentTime.isValid()) return momentTime.format('MM/DD/YY h:mm a');
  return DEFAULT_EMPTY_DATA;
};

export const columns = [
  {
    field: 'name',
    name: 'Monitor name',
    sortable: true,
    truncateText: true,
    textOnly: true,
    width: '150px',
    render: (name, item) => <EuiLink href={`${PLUGIN_NAME}#/monitors/${item.id}`}>{name}</EuiLink>,
  },
  {
    field: 'user',
    name: 'Last updated by',
    sortable: true,
    truncateText: true,
    textOnly: true,
    width: '100px',
    /* There are 3 cases:
    1. Monitors created by older versions and never updated.
       These monitors won’t have User details in the monitor object. `monitor.user` will be null.
    2. Monitors are created when security plugin is disabled, these will have empty User object.
       (`monitor.user.name`, `monitor.user.roles` are empty )
    3. Monitors are created when security plugin is enabled, these will have an User object. */
    render: (_, item) =>
      item.monitor.user && item.monitor.user.name ? item.monitor.user.name : 'N/A',
  },
  {
    field: 'latestAlert',
    name: 'Latest alert',
    sortable: false,
    truncateText: true,
    textOnly: true,
    width: '150px',
  },
  {
    field: 'enabled',
    name: 'State',
    sortable: false,
    truncateText: false,
    width: '100px',
    render: (enabled) => (enabled ? 'Enabled' : 'Disabled'),
  },
  {
    field: 'lastNotificationTime',
    name: 'Last notification time',
    sortable: true,
    truncateText: false,
    render: renderTime,
    dataType: 'date',
    width: '150px',
  },
  {
    field: 'active',
    name: 'Active',
    sortable: true,
    truncateText: false,
    width: '100px',
  },
  {
    field: 'acknowledged',
    name: 'Acknowledged',
    sortable: true,
    truncateText: false,
    width: '100px',
  },
  {
    field: 'errors',
    name: 'Errors',
    sortable: true,
    truncateText: false,
    width: '100px',
  },
  {
    field: 'ignored',
    name: 'Ignored',
    sortable: true,
    truncateText: false,
    width: '100px',
  },
];
