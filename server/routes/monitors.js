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

export default function (server, services) {
  const { monitorService } = services;

  server.route({
    path: '/api/alerting/monitors',
    method: 'GET',
    handler: monitorService.getMonitors,
  });

  server.route({
    path: '/api/alerting/monitors/_search',
    method: 'POST',
    handler: monitorService.searchMonitors,
  });

  server.route({
    path: '/api/alerting/monitors',
    method: 'POST',
    handler: monitorService.createMonitor,
  });

  server.route({
    path: '/api/alerting/monitors/_execute',
    method: 'POST',
    handler: monitorService.executeMonitor,
  });

  server.route({
    path: '/api/alerting/monitors/{id}',
    method: 'GET',
    handler: monitorService.getMonitor,
  });

  server.route({
    path: '/api/alerting/monitors/{id}',
    method: 'PUT',
    handler: monitorService.updateMonitor,
  });

  server.route({
    path: '/api/alerting/monitors/{id}',
    method: 'DELETE',
    handler: monitorService.deleteMonitor,
  });

  server.route({
    path: '/api/alerting/monitors/{id}/_acknowledge/alerts',
    method: 'POST',
    handler: monitorService.acknowledgeAlerts,
  });
}
