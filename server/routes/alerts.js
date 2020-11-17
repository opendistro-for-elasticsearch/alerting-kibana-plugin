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
  const { alertService } = services;

  router.get(
    {
      path: '/api/alerting/alerts',
      validate: {
        query: schema.object({
          from: schema.maybe(schema.number()),
          size: schema.number(),
          search: schema.maybe(schema.string()),
          sortField: schema.string(),
          sortDirection: schema.string(),
          severityLevel: schema.maybe(schema.string()),
          alertState: schema.maybe(schema.string()),
          monitorIds: schema.maybe(schema.string()),
        }),
      },
    },
    alertService.getAlerts
  );
}
