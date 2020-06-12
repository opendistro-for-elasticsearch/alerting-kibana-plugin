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

const { API, INDEX } = require('./constants');

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

Cypress.Commands.add('deleteAllIndices', () => {
  cy.request('DELETE', `${Cypress.env('elasticsearch')}/*?expand_wildcards=all`);
});

Cypress.Commands.add('deleteAllMonitors', () => {
  const body = {
    query: { exists: { field: 'monitor' } },
  };
  cy.request(
    'POST',
    `${Cypress.env('elasticsearch')}/${INDEX.OPENDISTRO_ALERTING_CONFIG}/_delete_by_query`,
    body
  );
});

Cypress.Commands.add('createMonitor', monitorJSON => {
  cy.request('POST', `${Cypress.env('elasticsearch')}${API.MONITOR_BASE}`, monitorJSON);
});

Cypress.Commands.add('createDestination', destinationJSON => {
  cy.request('POST', `${Cypress.env('elasticsearch')}${API.DESTINATION_BASE}`, destinationJSON);
});

Cypress.Commands.add('createAndExecuteMonitor', monitorJSON => {
  cy.request('POST', `${Cypress.env('elasticsearch')}${API.MONITOR_BASE}`, monitorJSON).then(
    response => {
      // response.body is automatically serialized into JSON
      cy.request(
        'POST',
        `${Cypress.env('elasticsearch')}${API.MONITOR_BASE}/${response.body._id}/_execute`
      );
    }
  );
});
