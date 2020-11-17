/*
 *   Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
  const { anomalyDetectorService } = services;

  router.get(
    {
      path: '/api/alerting/detectors/{detectorId}',
      validate: {
        params: schema.object({
          detectorId: schema.string(),
        }),
      },
    },
    anomalyDetectorService.getDetector
  );

  router.post(
    {
      path: '/api/alerting/detectors/_search',
      validate: false,
    },
    anomalyDetectorService.getDetectors
  );

  router.get(
    {
      path: '/api/alerting/detectors/{detectorId}/results',
      validate: {
        params: schema.object({
          detectorId: schema.string(),
        }),
        query: schema.any(),
      },
    },
    anomalyDetectorService.getDetectorResults
  );
}
