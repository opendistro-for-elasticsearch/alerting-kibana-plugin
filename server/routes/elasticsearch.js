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
  const { elasticsearchService } = services;

  // server.route({
  //   path: '/api/alerting/_search',
  //   method: 'POST',
  //   handler: elasticsearchService.search,
  // });

  router.post(
    {
      path: '/api/alerting/_search',
      validate: {
        body: schema.any(),
      },
    },
    elasticsearchService.search
  );

  // server.route({
  //   path: '/api/alerting/_indices',
  //   method: 'POST',
  //   handler: elasticsearchService.getIndices,
  // });

  router.post(
    {
      path: '/api/alerting/_indices',
      validate: {
        body: schema.any(),
      },
    },
    elasticsearchService.getIndices
  );

  // server.route({
  //   path: '/api/alerting/_aliases',
  //   method: 'POST',
  //   handler: elasticsearchService.getAliases,
  // });

  router.post(
    {
      path: '/api/alerting/_aliases',
      validate: {
        body: schema.any(),
      },
    },
    elasticsearchService.getAliases
  );

  // server.route({
  //   path: '/api/alerting/_mappings',
  //   method: 'POST',
  //   handler: elasticsearchService.getMappings,
  // });

  router.post(
    {
      path: '/api/alerting/_mappings',
      validate: {
        body: schema.any(),
      },
    },
    elasticsearchService.getMappings
  );

  // server.route({
  //   path: '/api/alerting/_plugins',
  //   method: 'GET',
  //   handler: elasticsearchService.getPlugins,
  // });

  router.get(
    {
      path: '/api/alerting/_plugins',
      validate: false,
    },
    elasticsearchService.getPlugins
  );

  // server.route({
  //   path: '/api/alerting/_settings',
  //   method: 'GET',
  //   handler: elasticsearchService.getSettings,
  // });

  router.get(
    {
      path: '/api/alerting/_settings',
      validate: false,
    },
    elasticsearchService.getSettings
  );
}
