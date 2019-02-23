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

export default function(server, services) {
  const { destinationsService } = services;

  server.route({
    path: '/api/alerting/destinations',
    method: 'GET',
    handler: destinationsService.getDestinations,
  });

  server.route({
    path: '/api/alerting/destinations/{destinationId}',
    method: 'GET',
    handler: destinationsService.getDestination,
  });

  server.route({
    path: '/api/alerting/destinations',
    method: 'POST',
    handler: destinationsService.createDestination,
  });

  server.route({
    path: '/api/alerting/destinations/{destinationId}',
    method: 'PUT',
    handler: destinationsService.updateDestination,
  });

  server.route({
    path: '/api/alerting/destinations/{destinationId}',
    method: 'DELETE',
    handler: destinationsService.deleteDestination,
  });
}
