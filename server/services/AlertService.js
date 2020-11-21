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

export default class AlertService {
  constructor(esDriver) {
    this.esDriver = esDriver;
  }

  getAlerts = async (context, req, res) => {
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

    var params;
    switch (sortField) {
      case 'monitor_name':
        params = {
          sortString: `${sortField}.keyword`,
          sortOrder: sortDirection,
        };
        break;
      case 'trigger_name':
        params = {
          sortString: `${sortField}.keyword`,
          sortOrder: sortDirection,
        };
        break;
      case 'start_time':
        params = {
          sortString: sortField,
          sortOrder: sortDirection,
        };
        break;
      case 'end_time':
        params = {
          sortString: sortField,
          sortOrder: sortDirection,
          missing: sortDirection === 'asc' ? '_last' : '_first',
        };
        break;
      case 'acknowledged_time':
        params = {
          sortString: sortField,
          sortOrder: sortDirection,
          missing: '_last',
        };
        break;
    }

    params.startIndex = from;
    params.size = size;
    params.severityLevel = severityLevel;
    params.alertState = alertState;
    params.searchString = search;
    if (search.trim()) params.searchString = `*${search.trim().split(' ').join('* *')}*`;
    if (monitorIds.length > 0)
      params.monitorId = !Array.isArray(monitorIds) ? monitorIds : monitorIds[0];

    const { callAsCurrentUser } = this.esDriver.asScoped(req);
    try {
      const resp = await callAsCurrentUser('alerting.getAlerts', params);
      const alerts = resp.alerts.map((hit) => {
        const alert = hit;
        const id = hit.alert_id;
        const version = hit.alert_version;
        return { id, ...alert, version };
      });
      const totalAlerts = resp.totalAlerts;

      return res.ok({
        body: {
          ok: true,
          alerts,
          totalAlerts,
        },
      });
    } catch (err) {
      console.log(err.message);
      return res.ok({
        body: {
          ok: false,
          error: err.message,
        },
      });
    }
  };
}
