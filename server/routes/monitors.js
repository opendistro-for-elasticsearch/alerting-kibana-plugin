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

  router.post(
    {
      path: '/api/alerting/monitors/_search',
      validate: {
        body: schema.any(),
      },
    },
    monitorService.searchMonitors
  );

  router.post(
    {
      path: '/api/alerting/monitors',
      validate: {
        body: schema.any(),
      },
    },
    monitorService.createMonitor
  );

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

  router.put(
    {
      path: '/api/alerting/monitors/{id}',
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
        query: schema.object({
          ifSeqNo: schema.number(),
          ifPrimaryTerm: schema.number(),
        }),
        body: schema.any(),
      },
    },
    monitorService.updateMonitor
  );

  router.delete(
    {
      path: '/api/alerting/monitors/{id}',
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
        query: schema.object({
          version: schema.number(),
        }),
      },
    },
    monitorService.deleteMonitor
  );

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
