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

import { schema } from '@kbn/config-schema';

export default function (services, router) {
  const { monitorService } = services;

  // server.route({
  //   path: '/api/alerting/monitors',
  //   method: 'GET',
  //   handler: monitorService.getMonitors,
  // });

  router.get(
    {
      path: '/api/alerting/monitors',
      validate: {
        query: schema.object({
          from: schema.number(),
          size: schema.number(),
          search: schema.string(),
          sortField: schema.string(),
          sortDirection: schema.string(),
          state: schema.string(),
        }),
      },
    },
    monitorService.getMonitors
  );

  // server.route({
  //   path: '/api/alerting/monitors',
  //   method: 'POST',
  //   handler: monitorService.createMonitor,
  // });

  router.post(
    {
      path: '/api/alerting/monitors',
      validate: {
        body: schema.any(),
      },
    },
    monitorService.createMonitor
  );

  // server.route({
  //   path: '/api/alerting/monitors/_execute',
  //   method: 'POST',
  //   handler: monitorService.executeMonitor,
  // });

  router.post(
    {
      path: '/api/alerting/monitors/_execute',
      validate: {
        query: schema.object({
          dryrun: schema.maybe(schema.string()),
        }),
        body: schema.any(),
      },
    },
    monitorService.executeMonitor
  );

  // server.route({
  //   path: '/api/alerting/monitors/{id}',
  //   method: 'GET',
  //   handler: monitorService.getMonitor,
  // });

  router.get(
    {
      path: '/api/alerting/monitors/{id}',
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    monitorService.getMonitor
  );

  // server.route({
  //   path: '/api/alerting/monitors/{id}',
  //   method: 'PUT',
  //   handler: monitorService.updateMonitor,
  // });

  router.put(
    {
      path: '/api/alerting/monitors/{id}',
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
        query: schema.object({
          ifSeqNo: schema.string(),
          ifPrimaryTerm: schema.string(),
        }),
        body: schema.any(),
      },
    },
    monitorService.updateMonitor
  );

  // server.route({
  //   path: '/api/alerting/monitors/{id}',
  //   method: 'DELETE',
  //   handler: monitorService.deleteMonitor,
  // });

  router.delete(
    {
      path: '/api/alerting/monitors/{id}',
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    monitorService.deleteMonitor
  );

  // server.route({
  //   path: '/api/alerting/monitors/{id}/_acknowledge/alerts',
  //   method: 'POST',
  //   handler: monitorService.acknowledgeAlerts,
  // });

  router.post(
    {
      path: '/api/alerting/monitors/{id}/_acknowledge/alerts',
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
        body: schema.any(),
      },
    },
    monitorService.acknowledgeAlerts
  );
}
