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

import { CLUSTER } from './utils/constants';
import { INDEX } from '../../utils/constants';

export default class AlertService {
  constructor(esDriver) {
    this.esDriver = esDriver;
  }

  getAlerts = async (req, h) => {
    const {
      from = 0,
      size = 20,
      search = '',
      sortDirection = 'desc',
      sortField = 'start_time',
      severityLevel = 'ALL',
      alertState = 'ALL',
      monitorIds = [],
    } = req.query;

    const filterQueries = [];
    const mustQueries = [];

    if (alertState !== 'ALL') {
      filterQueries.push({ term: { state: alertState } });
    }

    if (severityLevel !== 'ALL') {
      filterQueries.push({ term: { severity: severityLevel } });
    }
    if (monitorIds) {
      if (Array.isArray(monitorIds) && monitorIds.length) {
        filterQueries.push({ terms: { monitor_id: monitorIds } });
      }
      if (typeof monitorIds === 'string') {
        filterQueries.push({ term: { monitor_id: monitorIds } });
      }
    }

    if (search.trim()) {
      mustQueries.push({
        query_string: {
          fields: ['monitor_name', 'trigger_name'],
          default_operator: 'AND',
          query: `*${search
            .trim()
            .split(' ')
            .join('* *')}*`,
        },
      });
    } else {
      mustQueries.push({ match_all: {} });
    }

    const sortQueryMap = {
      monitor_name: { [`${sortField}.keyword`]: sortDirection },
      trigger_name: { [`${sortField}.keyword`]: sortDirection },
      start_time: { [sortField]: sortDirection },
      end_time: {
        [sortField]: {
          order: sortDirection,
          missing: sortDirection === 'asc' ? '_last' : '_first',
        },
      },
      acknowledged_time: { [sortField]: { order: sortDirection, missing: '_last' } },
    };

    let sort = [];
    const sortQuery = sortQueryMap[sortField];
    if (sortQuery) sort = sortQuery;

    let routing = undefined;
    if (monitorIds) {
      if (Array.isArray(monitorIds) && monitorIds.length) {
        routing = monitorIds.join(',');
      }
      if (typeof monitorIds === 'string') {
        routing = monitorIds;
      }
    }

    const params = {
      index: INDEX.ALL_ALERTS,
      version: true,
      routing,
      body: {
        sort,
        size,
        from,
        query: {
          bool: {
            filter: filterQueries,
            must: mustQueries,
          },
        },
      },
    };

    const { callWithRequest } = this.esDriver.getCluster(CLUSTER.DATA);
    try {
      const resp = await callWithRequest(req, 'search', params);
      const totalAlerts = resp.hits.total.value;
      const alerts = resp.hits.hits.map(hit => {
        const { _source: alert, _id: id, _version: version } = hit;
        return { id, ...alert, version };
      });
      return { ok: true, alerts, totalAlerts };
    } catch (err) {
      return { ok: false, resp };
    }
  };
}
