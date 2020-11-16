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
  const { destinationsService } = services;

  // server.route({
  //   path: '/api/alerting/destinations',
  //   method: 'GET',
  //   handler: destinationsService.getDestinations,
  // });

  router.get(
    {
      path: '/api/alerting/destinations',
      validate: {
        query: schema.object({
          from: schema.maybe(schema.number()),
          size: schema.number(),
          search: schema.string(),
          sortField: schema.maybe(schema.string()),
          sortDirection: schema.maybe(schema.string()),
          type: schema.maybe(schema.string()),
        }),
      },
    },
    destinationsService.getDestinations
  );

  // server.route({
  //   path: '/api/alerting/destinations/{destinationId}',
  //   method: 'GET',
  //   handler: destinationsService.getDestination,
  // });

  router.get(
    {
      path: '/api/alerting/destinations/{destinationId}',
      validate: {
        params: schema.object({
          destinationId: schema.string(),
        }),
      },
    },
    destinationsService.getDestination
  );

  // server.route({
  //   path: '/api/alerting/destinations',
  //   method: 'POST',
  //   handler: destinationsService.createDestination,
  // });

  router.post(
    {
      path: '/api/alerting/destinations',
      validate: {
        body: schema.any(),
      },
    },
    destinationsService.createDestination
  );

  // server.route({
  //   path: '/api/alerting/destinations/{destinationId}',
  //   method: 'PUT',
  //   handler: destinationsService.updateDestination,
  // });

  router.put(
    {
      path: '/api/alerting/destinations/{destinationId}',
      validate: {
        params: schema.object({
          destinationId: schema.string(),
        }),
        query: schema.object({
          ifSeqNo: schema.string(),
          ifPrimaryTerm: schema.string(),
        }),
        body: schema.any(),
      },
    },
    destinationsService.updateDestination
  );

  // server.route({
  //   path: '/api/alerting/destinations/{destinationId}',
  //   method: 'DELETE',
  //   handler: destinationsService.deleteDestination,
  // });

  router.delete(
    {
      path: '/api/alerting/destinations/{destinationId}',
      validate: {
        params: schema.object({
          destinationId: schema.string(),
        }),
      },
    },
    destinationsService.deleteDestination
  );

  // server.route({
  //   path: '/api/alerting/destinations/email_accounts',
  //   method: 'GET',
  //   handler: destinationsService.getEmailAccounts,
  // });

  router.get(
    {
      path: '/api/alerting/destinations/email_accounts',
      validate: {
        query: schema.object({
          search: schema.maybe(schema.string()),
          size: schema.number(),
        }),
      },
    },
    destinationsService.getEmailAccounts
  );

  // server.route({
  //   path: '/api/alerting/destinations/email_accounts',
  //   method: 'POST',
  //   handler: destinationsService.createEmailAccount,
  // });

  router.post(
    {
      path: '/api/alerting/destinations/email_accounts',
      validate: {
        body: schema.any(),
      },
    },
    destinationsService.createEmailAccount
  );

  // server.route({
  //   path: '/api/alerting/destinations/email_accounts/{id}',
  //   method: 'GET',
  //   handler: destinationsService.getEmailAccount,
  // });

  router.get(
    {
      path: '/api/alerting/destinations/email_accounts/{id}',
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
        query: schema.object({
          search: schema.maybe(schema.string()),
          size: schema.number(),
        }),
      },
    },
    destinationsService.getEmailAccount
  );

  // server.route({
  //   path: '/api/alerting/destinations/email_accounts/{id}',
  //   method: 'PUT',
  //   handler: destinationsService.updateEmailAccount,
  // });

  router.put(
    {
      path: '/api/alerting/destinations/email_accounts/{id}',
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
    destinationsService.updateEmailAccount
  );

  // server.route({
  //   path: '/api/alerting/destinations/email_accounts/{id}',
  //   method: 'DELETE',
  //   handler: destinationsService.deleteEmailAccount,
  // });

  router.delete(
    {
      path: '/api/alerting/destinations/email_accounts/{id}',
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    destinationsService.deleteEmailAccount
  );

  // server.route({
  //   path: '/api/alerting/destinations/email_groups',
  //   method: 'GET',
  //   handler: destinationsService.getEmailGroups,
  // });

  router.get(
    {
      path: '/api/alerting/destinations/email_groups',
      validate: {
        query: schema.object({
          search: schema.maybe(schema.string()),
          size: schema.number(),
        }),
      },
    },
    destinationsService.getEmailGroups
  );

  // server.route({
  //   path: '/api/alerting/destinations/email_groups',
  //   method: 'POST',
  //   handler: destinationsService.createEmailGroup,
  // });

  router.post(
    {
      path: '/api/alerting/destinations/email_groups',
      validate: {
        body: schema.any(),
      },
    },
    destinationsService.createEmailGroup
  );

  // server.route({
  //   path: '/api/alerting/destinations/email_groups/{id}',
  //   method: 'GET',
  //   handler: destinationsService.getEmailGroup,
  // });

  router.get(
    {
      path: '/api/alerting/destinations/email_groups/{id}',
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
        query: schema.object({
          search: schema.maybe(schema.string()),
          size: schema.number(),
        }),
      },
    },
    destinationsService.getEmailGroup
  );

  // server.route({
  //   path: '/api/alerting/destinations/email_groups/{id}',
  //   method: 'PUT',
  //   handler: destinationsService.updateEmailGroup,
  // });

  router.put(
    {
      path: '/api/alerting/destinations/email_groups/{id}',
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
    destinationsService.updateEmailGroup
  );

  // server.route({
  //   path: '/api/alerting/destinations/email_groups/{id}',
  //   method: 'DELETE',
  //   handler: destinationsService.deleteEmailGroup,
  // });

  router.delete(
    {
      path: '/api/alerting/destinations/email_groups/{id}',
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    destinationsService.deleteEmailGroup
  );
}
