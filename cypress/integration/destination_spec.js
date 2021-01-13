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

import { PLUGIN_NAME } from '../support/constants';
import sampleDestination from '../fixtures/sample_destination_custom_webhook';
import sampleDestinationChime from '../fixtures/sample_destination_chime';

const SAMPLE_DESTINATION = 'sample_destination';
const SAMPLE_DESTINATION_WITH_ANOTHER_NAME = 'sample_destination_chime';
const UPDATED_DESTINATION = 'updated_destination';
const SAMPLE_URL = 'http://www.sampledestination.com';

describe('Destinations', () => {
  beforeEach(() => {
    // Set welcome screen tracking to false
    localStorage.setItem('home:welcome:show', 'false');

    // Visit Alerting Kibana
    cy.visit(`${Cypress.env('kibana')}/app/${PLUGIN_NAME}#/destinations`);

    // Common text to wait for to confirm page loaded, give up to 20 seconds for initial load
    cy.contains('Add destination', { timeout: 20000 });
  });

  describe('can be created', () => {
    before(() => {
      cy.deleteAllDestinations();
    });

    it('with a custom webhook', () => {
      // Confirm we loaded empty destination list
      cy.contains('There are no existing destinations');

      // Route us to create destination page
      cy.contains('Add destination').click({ force: true });

      // Wait for input to load and then type in the destination name
      cy.get('input[name="name"]').type(SAMPLE_DESTINATION, { force: true });

      // Select the type of destination
      cy.get('#type').select('custom_webhook', { force: true });

      // Wait for input to load and then type in the index name
      cy.get('input[name="custom_webhook.url"]').type(SAMPLE_URL, { force: true });

      // Click the create button
      cy.get('button').contains('Create').click({ force: true });

      // Confirm we can see the created destination in the list
      cy.contains(SAMPLE_DESTINATION);
    });
  });

  describe('can be updated', () => {
    before(() => {
      cy.deleteAllDestinations();
      cy.createDestination(sampleDestination);
    });

    it('by changing the name', () => {
      // Confirm we can see the created destination in the list
      cy.contains(SAMPLE_DESTINATION);

      // Click the Edit button
      cy.get('button').contains('Edit').click({ force: true });

      // Wait for input to load and then type in the destination name
      // should() is used to wait for input loading before clearing
      cy.get('input[name="name"]')
        .should('have.value', SAMPLE_DESTINATION)
        .clear()
        .type(UPDATED_DESTINATION, { force: true });

      // Click the create button
      cy.get('button').contains('Update').click({ force: true });

      // Confirm we can see the updated destination in the list
      cy.contains(UPDATED_DESTINATION);
    });
  });

  describe('can be deleted', () => {
    before(() => {
      cy.deleteAllDestinations();
      cy.createDestination(sampleDestination);
    });

    it('by clicking the button under "Actions"', () => {
      // Confirm we can see the created destination in the list
      cy.contains(SAMPLE_DESTINATION);

      // Click the Delete button
      cy.contains('Delete').click({ force: true });

      // Click the delete confirmation button in modal
      cy.get(`[data-test-subj="confirmModalConfirmButton"]`).click();

      // Confirm we can see an empty destination list
      cy.contains('There are no existing destinations');
    });
  });

  describe('can be searched', () => {
    before(() => {
      cy.deleteAllDestinations();
      // Create 21 destinations so that a monitor will not appear in the first page
      for (let i = 0; i < 20; i++) {
        cy.createDestination(sampleDestination);
      }
      cy.createDestination(sampleDestinationChime);
    });

    it('by name', () => {
      // Sort the table by monitor name in alphabetical order
      cy.get('thead > tr > th').contains('Destination name').click({ force: true });

      // Confirm the monitor with a different name does not exist
      cy.contains(SAMPLE_DESTINATION_WITH_ANOTHER_NAME).should('not.exist');

      // Type in monitor name in search box
      cy.get(`input[type="search"]`).focus().type(SAMPLE_DESTINATION_WITH_ANOTHER_NAME);

      // Confirm we filtered down to our one and only destination
      cy.get('tbody > tr').should(($tr) => {
        expect($tr, '1 row').to.have.length(1);
        expect($tr, 'item').to.contain(SAMPLE_DESTINATION_WITH_ANOTHER_NAME);
      });
    });
  });

  after(() => {
    // Delete all existing destinations
    cy.deleteAllDestinations();
  });
});
