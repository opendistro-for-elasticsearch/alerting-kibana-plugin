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

import { INDEX, PLUGIN_NAME } from '../support/constants';
import sampleMonitor from '../fixtures/sample_monitor';
import sampleMonitorWithAnotherName from '../fixtures/sample_monitor_with_another_name';

// const POLICY_ID = "test_policy_id";
const SAMPLE_MONITOR = 'sample_monitor';
const UPDATED_MONITOR = 'updated_trigger';
const SAMPLE_MONITOR_WITH_ANOTHER_NAME = 'sample_monitor_with_another_name';

describe('Monitors', () => {
  beforeEach(() => {
    // Set welcome screen tracking to false
    localStorage.setItem('home:welcome:show', 'false');

    // Visit Alerting Kibana
    cy.visit(`${Cypress.env('kibana')}/app/${PLUGIN_NAME}#/monitors`);

    // Common text to wait for to confirm page loaded, give up to 20 seconds for initial load
    cy.contains('Create monitor', { timeout: 20000 });
  });

  describe('can be created', () => {
    before(() => {
      cy.deleteAllIndices();
    });

    it('successfully', () => {
      // Confirm we loaded empty monitor list
      cy.contains('There are no existing monitors');

      // Route us to create monitor page
      cy.contains('Create monitor').click({ force: true });

      // Wait for input to load and then type in the monitor name
      cy.get('input[name="name"]').type(SAMPLE_MONITOR, { force: true });

      // Select the method of definition
      cy.get('#searchType').select('query', { force: true });

      // Wait for input to load and then type in the policy ID
      cy.get('#index').type('*', { force: true });

      // Click the create button
      cy.get('button')
        .contains('Create')
        .click({ force: true });

      // Confirm "monitor is created" shows
      cy.contains(`Monitor ${SAMPLE_MONITOR} has been created`);

      // Go back to main page of the Plugin
      cy.get('a')
        .contains('Alerting')
        .click({ force: true });

      // Go to the Monitors list
      cy.get('button')
        .contains('Monitors')
        .click({ force: true });

      // Confirm we can see the created monitor in the list
      cy.contains(`${SAMPLE_MONITOR}`);
    });
  });

  describe('can be updated by changing a name', () => {
    before(() => {
      cy.deleteAllIndices();
      cy.createMonitor(sampleMonitor);
    });

    it('successfully', () => {
      // Confirm we can see the created monitor in the list
      cy.contains(`${SAMPLE_MONITOR}`);

      // Select the existing monitor
      cy.get('a')
        .contains(`${SAMPLE_MONITOR}`)
        .click({ force: true });

      // Click Edit button
      cy.contains('Edit').click({ force: true });

      // Wait for input to load and then type in the new monitor name
      cy.get('input[name="name"]')
        .focus()
        .clear()
        .type(`${UPDATED_MONITOR}`, { force: true });

      // Click Update button
      cy.get('button')
        .contains('Update')
        .click({ force: true });

      // Go back to main page of the Plugin
      cy.get('a')
        .contains('Alerting')
        .click({ force: true });

      // Go to the Monitors list
      cy.get('button')
        .contains('Monitors')
        .click({ force: true });

      // Confirm we can see the updated monitor in the list
      cy.contains(`${UPDATED_MONITOR}`);
    });
  });

  describe('can be deleted', () => {
    before(() => {
      cy.deleteAllIndices();
      cy.createMonitor(sampleMonitor);
    });

    it('successfully', () => {
      // Confirm we can see the created monitor in the list
      cy.contains(`${SAMPLE_MONITOR}`);

      // Select checkbox for the existing monitor
      cy.get('input[data-test-subj^="checkboxSelectRow-"]').click({ force: true });

      // Click Actions button to open the actions menu
      cy.contains('Actions').click({ force: true });

      // Click the Delete button
      cy.contains('Delete').click({ force: true });
    });
  });

  describe('can be searched', () => {
    before(() => {
      cy.deleteAllIndices();
      // Create 6 monitors so that a monitor will not appear in the first page
      for (let i = 0; i < 5; i++) {
        cy.createMonitor(sampleMonitor);
      }
      cy.createMonitor(sampleMonitorWithAnotherName);
    });

    it('successfully', () => {
      cy.contains('Rows per page').click({ force: true });
      cy.contains('5 rows').click({ force: true });

      // Sort the table by policy name
      cy.get('thead > tr > th')
        .contains('Monitor name')
        .click({ force: true });

      // Confirm the monitor with a different name does not exist
      cy.contains(`${SAMPLE_MONITOR_WITH_ANOTHER_NAME}`).should('not.exist');

      // Type in monitor name in search box
      cy.get(`input[type="search"]`)
        .focus()
        .type(`${SAMPLE_MONITOR_WITH_ANOTHER_NAME}`);

      // Confirm we filtered down to our one and only policy
      cy.get('tbody > tr').should($tr => {
        expect($tr, '1 row').to.have.length(1);
        expect($tr, 'item').to.contain(`${SAMPLE_MONITOR_WITH_ANOTHER_NAME}`);
      });
    });
  });
});
