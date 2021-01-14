/*
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

const { API, ADMIN_AUTH } = require('./constants');

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.overwrite('visit', (originalFn, url, options) => {
  // Add the basic auth header when security enabled in the Elasticsearch cluster
  // https://github.com/cypress-io/cypress/issues/1288
  if (Cypress.env('security_enabled')) {
    if (options) {
      options.auth = ADMIN_AUTH;
    } else {
      options = { auth: ADMIN_AUTH };
    }
    return originalFn(url, options);
  } else {
    return originalFn(url, options);
  }
});

// Be able to add default options to cy.request(), https://github.com/cypress-io/cypress/issues/726
Cypress.Commands.overwrite('request', (originalFn, ...args) => {
  let defaults = {};
  // Add the basic authentication header when security enabled in the Elasticsearch cluster
  if (Cypress.env('security_enabled')) {
    defaults.auth = ADMIN_AUTH;
  }

  let options = {};
  if (typeof args[0] === 'object' && args[0] !== null) {
    options = Object.assign({}, args[0]);
  } else if (args.length === 1) {
    [options.url] = args;
  } else if (args.length === 2) {
    [options.method, options.url] = args;
  } else if (args.length === 3) {
    [options.method, options.url, options.body] = args;
  }

  return originalFn(Object.assign({}, defaults, options));
});

Cypress.Commands.add('createMonitor', (monitorJSON) => {
  cy.request('POST', `${Cypress.env('elasticsearch')}${API.MONITOR_BASE}`, monitorJSON);
});

Cypress.Commands.add('createDestination', (destinationJSON) => {
  cy.request('POST', `${Cypress.env('elasticsearch')}${API.DESTINATION_BASE}`, destinationJSON);
});

Cypress.Commands.add('createAndExecuteMonitor', (monitorJSON) => {
  cy.request('POST', `${Cypress.env('elasticsearch')}${API.MONITOR_BASE}`, monitorJSON).then(
    (response) => {
      cy.request(
        'POST',
        `${Cypress.env('elasticsearch')}${API.MONITOR_BASE}/${response.body._id}/_execute`
      );
    }
  );
});

Cypress.Commands.add('deleteMonitorByName', (monitorName) => {
  const body = {
    query: {
      match: {
        'monitor.name': {
          query: monitorName,
          operator: 'and',
        },
      },
    },
  };
  cy.request('GET', `${Cypress.env('elasticsearch')}${API.MONITOR_BASE}/_search`, body).then(
    (response) => {
      cy.request(
        'DELETE',
        `${Cypress.env('elasticsearch')}${API.MONITOR_BASE}/${response.body.hits.hits[0]._id}`
      );
    }
  );
});

Cypress.Commands.add('deleteAllMonitors', () => {
  const body = {
    size: 200,
    query: {
      exists: {
        field: 'monitor',
      },
    },
  };
  cy.request({
    method: 'GET',
    url: `${Cypress.env('elasticsearch')}${API.MONITOR_BASE}/_search`,
    failOnStatusCode: false, // In case there is no alerting config index in cluster, where the status code is 404
    body,
  }).then((response) => {
    if (response.status === 200) {
      for (let i = 0; i < response.body.hits.total.value; i++) {
        cy.request(
          'DELETE',
          `${Cypress.env('elasticsearch')}${API.MONITOR_BASE}/${response.body.hits.hits[i]._id}`
        );
      }
    } else {
      cy.log('Failed to get all monitors.', response);
    }
  });
});

Cypress.Commands.add('deleteAllDestinations', () => {
  cy.request({
    method: 'GET',
    url: `${Cypress.env('elasticsearch')}${API.DESTINATION_BASE}?size=200`,
    failOnStatusCode: false, // In case there is no alerting config index in cluster, where the status code is 404
  }).then((response) => {
    if (response.status === 200) {
      for (let i = 0; i < response.body.totalDestinations; i++) {
        cy.request(
          'DELETE',
          `${Cypress.env('elasticsearch')}${API.DESTINATION_BASE}/${
            response.body.destinations[i].id
          }`
        );
      }
    } else {
      cy.log('Failed to get all destinations.', response);
    }
  });
});

Cypress.Commands.add('createIndexByName', (indexName) => {
  cy.request('PUT', `${Cypress.env('elasticsearch')}/${indexName}`);
});

Cypress.Commands.add('deleteIndexByName', (indexName) => {
  cy.request('DELETE', `${Cypress.env('elasticsearch')}/${indexName}`);
});

Cypress.Commands.add('insertDocumentToIndex', (indexName, documentId, documentBody) => {
  cy.request(
    'PUT',
    `${Cypress.env('elasticsearch')}/${indexName}/_doc/${documentId}`,
    documentBody
  );
});
