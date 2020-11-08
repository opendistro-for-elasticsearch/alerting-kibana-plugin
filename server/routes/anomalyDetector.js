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

export default function (server, services) {
  const { anomalyDetectorService } = services;

  // server.route({
  //   path: '/api/alerting/detectors/{detectorId}',
  //   method: 'GET',
  //   handler: anomalyDetectorService.getDetector,
  // });
  //
  // server.route({
  //   path: '/api/alerting/detectors/_search',
  //   method: 'POST',
  //   handler: anomalyDetectorService.getDetectors,
  // });
  //
  // server.route({
  //   path: '/api/alerting/detectors/{detectorId}/results',
  //   method: 'GET',
  //   handler: anomalyDetectorService.getDetectorResults,
  // });

  router.get(
    {
      path: '/api/alerting/detectors/{detectorId}',
      validate: false,
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
      validate: false,
    },
    anomalyDetectorService.getDetectorResults
  );
}
