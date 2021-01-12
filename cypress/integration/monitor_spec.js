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
import sampleMonitor from '../fixtures/sample_monitor';
import sampleMonitorWithAlwaysTrueTrigger from '../fixtures/sample_monitor_with_always_true_trigger';
import sampleDestination from '../fixtures/sample_destination_custom_webhook.json';

const SAMPLE_MONITOR = 'sample_monitor';
const UPDATED_MONITOR = 'updated_monitor';
const SAMPLE_MONITOR_WITH_ANOTHER_NAME = 'sample_monitor_with_always_true_trigger';
const SAMPLE_TRIGGER = 'sample_trigger';
const SAMPLE_ACTION = 'sample_action';

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

    it('defining by extraction query', () => {
      // Confirm we loaded empty monitor list
      cy.contains('There are no existing monitors');

      // Route us to create monitor page
      cy.contains('Create monitor').click({ force: true });

      // Wait for input to load and then type in the monitor name
      cy.get('input[name="name"]').type(SAMPLE_MONITOR, { force: true });

      // Select the method of definition
      cy.get('#searchType').select('query', { force: true });

      // Wait for input to load and then type in the index name
      cy.get('#index').type('*', { force: true });

      // Click the create button
      cy.get('button').contains('Create').click({ force: true });

      // Confirm "monitor is created" shows
      cy.contains(`Monitor ${SAMPLE_MONITOR} has been created`);

      // Go back to the Monitors list
      cy.get('a').contains('Monitors').click({ force: true });

      // Confirm we can see the created monitor in the list
      cy.contains(SAMPLE_MONITOR);
    });
  });

  describe('can be updated', () => {
    before(() => {
      cy.deleteAllIndices();
      cy.createMonitor(sampleMonitor);
    });

    it('by changing the name', () => {
      // Confirm we can see the created monitor in the list
      cy.contains(SAMPLE_MONITOR);

      // Select the existing monitor
      cy.get('a').contains(SAMPLE_MONITOR).click({ force: true });

      // Click Edit button
      cy.contains('Edit').click({ force: true });

      // Wait for input to load and then type in the new monitor name
      cy.get('input[name="name"]').focus().clear().type(UPDATED_MONITOR, { force: true });

      // Click Update button
      cy.get('button').contains('Update').last().click({ force: true });

      // Confirm the update process is done and the page loaded
      cy.contains('Create trigger');

      // Go back to the Monitors list
      cy.get('a').contains('Monitors').click({ force: true });

      // Confirm we can see the updated monitor in the list
      cy.contains(UPDATED_MONITOR);
    });
  });

  describe('can be deleted', () => {
    before(() => {
      cy.deleteAllIndices();
      cy.createMonitor(sampleMonitor);
    });

    it('from "Actions" menu', () => {
      // Confirm we can see the created monitor in the list
      cy.contains(SAMPLE_MONITOR);

      // Select checkbox for the existing monitor
      cy.get('input[data-test-subj^="checkboxSelectRow-"]').click({ force: true });

      // Click Actions button to open the actions menu
      cy.contains('Actions').click({ force: true });

      // Click the Delete button
      cy.contains('Delete').click({ force: true });

      // Confirm we can see an empty monitor list
      cy.contains('There are no existing monitors');
    });
  });

  describe('can be searched', () => {
    before(() => {
      cy.deleteAllIndices();
      // Create 21 monitors so that a monitor will not appear in the first page
      for (let i = 0; i < 20; i++) {
        cy.createMonitor(sampleMonitor);
      }
      cy.createMonitor(sampleMonitorWithAlwaysTrueTrigger);
    });

    it('by name', () => {
      // Sort the table by monitor name in alphabetical order
      cy.get('thead > tr > th').contains('Monitor name').click({ force: true });

      // Confirm the monitor with a different name does not exist
      cy.contains(SAMPLE_MONITOR_WITH_ANOTHER_NAME).should('not.exist');

      // Type in monitor name in search box
      cy.get(`input[type="search"]`).focus().type(SAMPLE_MONITOR_WITH_ANOTHER_NAME);

      // Confirm we filtered down to our one and only monitor
      cy.get('tbody > tr').should(($tr) => {
        expect($tr, '1 row').to.have.length(1);
        expect($tr, 'item').to.contain(SAMPLE_MONITOR_WITH_ANOTHER_NAME);
      });
    });
  });

  describe('can have triggers', () => {
    before(() => {
      cy.deleteAllIndices();
      cy.createMonitor(sampleMonitor);
    });

    it('a trigger can be created', () => {
      // Confirm we can see the created monitor in the list
      cy.contains(SAMPLE_MONITOR);

      // Select the existing monitor
      cy.get('a').contains(SAMPLE_MONITOR).click({ force: true });

      // Click Create Trigger button
      cy.contains('Create trigger').click({ force: true });

      // Wait for input to load and then type in the trigger name
      cy.get('input[name="name"]').type(SAMPLE_TRIGGER, { force: true });

      // Click the create button
      cy.get('button').contains('Create').click({ force: true });

      // Confirm we can see only one row in the trigger list by checking <caption> element
      cy.contains('This table contains 1 row');

      // Confirm we can see the new trigger
      cy.contains(SAMPLE_TRIGGER);
    });

    it('an action can be attached to the trigger', () => {
      // Create a destination
      cy.createDestination(sampleDestination);

      // Confirm we can see the created monitor in the list
      cy.contains(SAMPLE_MONITOR);

      // Select the existing monitor
      cy.get('a').contains(SAMPLE_MONITOR).click({ force: true });

      // Select checkbox for the existing monitor
      cy.get('input[data-test-subj^="checkboxSelectRow-"]').click({ force: true });

      // Click the trigger Edit button
      cy.get('.euiPanel').contains('Edit').click({ force: true });

      // Click the Add Action button to configure trigger actions
      cy.contains('Add action').click({ force: true });

      // Wait for input to load and then type in the action name
      cy.get('input[name="actions.0.name"]').type(SAMPLE_ACTION, { force: true });

      // Click the combo box to list all the destinations
      // Using key typing instead of clicking the menu option to avoid occasional failure
      cy.get('div[data-test-subj="comboBoxInput"]')
        .click({ force: true })
        .type('{downarrow}{enter}');

      // Click Update button to update the monitor
      cy.get('button').contains('Update').click({ force: true });

      // The following is used to validate the action has been added.
      // Confirm the update process is done and the page loaded
      cy.contains('Create trigger');

      // This step is used to make the actions list of the trigger refresh
      // Go to the Monitors list
      cy.get('a').contains('Monitors').click({ force: true });

      // Select the existing monitor
      cy.get('span > a').contains(SAMPLE_MONITOR).click({ force: true });

      // Select checkbox for the created trigger
      cy.get('input[data-test-subj^="checkboxSelectRow-"]').click({ force: true });

      // Click the trigger Edit button
      cy.get('div.euiPanel').contains('Edit').click({ force: true });

      // Confirm we can see the new action
      cy.contains(SAMPLE_ACTION);
    });
  });
});
