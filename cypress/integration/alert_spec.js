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
import sampleMonitorWithAlwaysTrueTrigger from '../fixtures/sample_monitor_with_always_true_trigger';
import sampleMonitorWorkflow from '../fixtures/sample_monitor_workflow_7.1.json';

const SAMPLE_MONITOR_TO_BE_DELETED = 'sample_monitor_with_always_true_trigger';
const SAMPLE_MONITOR_WORKFLOW = 'sample_monitor_workflow';

describe('Alerts', () => {
  beforeEach(() => {
    // Set welcome screen tracking to false
    localStorage.setItem('home:welcome:show', 'false');

    // Visit Alerting Kibana
    cy.visit(`${Cypress.env('kibana')}/app/${PLUGIN_NAME}#`);

    // Common text to wait for to confirm page loaded, give up to 30 seconds for initial load
    cy.contains('Acknowledge', { timeout: 30000 });
  });

  describe("can be in 'Active' state", () => {
    before(() => {
      cy.deleteAllIndices();
      cy.createMonitor(sampleMonitorWithAlwaysTrueTrigger);
    });

    it('after the monitor starts running', () => {
      // Wait for 1 minute
      cy.wait(60000);

      // Reload the page
      cy.reload();

      // Confirm we can see one and only alert in Active state
      cy.get('tbody > tr').should(($tr) => {
        expect($tr, '1 row').to.have.length(1);
        expect($tr, 'item').to.contain('Active');
      });
    });
  });

  describe("can be in 'Acknowledged' state", () => {
    before(() => {
      cy.deleteAllIndices();
      cy.createAndExecuteMonitor(sampleMonitorWithAlwaysTrueTrigger);
    });

    it('by clicking the button in Dashboard', () => {
      //Confirm there is an active alert
      cy.contains('Active');

      // Select checkbox for the existing alert
      cy.get('input[data-test-subj^="checkboxSelectRow-"]').click({ force: true });

      // Click Acknowledge button
      cy.get('button').contains('Acknowledge').click({ force: true });

      // Confirm we can see the alert is in 'Acknowledged' state
      cy.contains('Acknowledged');
    });
  });

  describe("can be in 'Completed' state", () => {
    before(() => {
      cy.deleteAllIndices();
      cy.createMonitor(sampleMonitorWithAlwaysTrueTrigger);
      cy.createAndExecuteMonitor(sampleMonitorWorkflow);
    });

    it('when the trigger condition is not met after met once', () => {
      //Confirm there is an active alert
      cy.contains('Active');

      // Select checkbox for the existing alert
      cy.get('input[data-test-subj^="checkboxSelectRow-"]').click({ force: true });

      // Click Monitors button to route to Monitors tab
      cy.get('button').contains('Monitors').click({ force: true });

      // Type in monitor name in search box
      cy.get(`input[type="search"]`).focus().type(SAMPLE_MONITOR_TO_BE_DELETED);

      // Confirm we filtered down to our one and only monitor
      cy.get('tbody > tr').should(($tr) => {
        expect($tr, '1 row').to.have.length(1);
        expect($tr, 'item').to.contain(SAMPLE_MONITOR_TO_BE_DELETED);
      });

      // Select checkbox for the existing monitor
      cy.get('input[data-test-subj^="checkboxSelectRow-"]').first().click({ force: true });

      // Click Actions button to open the actions menu
      cy.contains('Actions').click({ force: true });

      // Click the Delete button
      cy.contains('Delete').click({ force: true });

      // Clear the text in the search box
      cy.get(`input[type="search"]`).focus().clear();

      // Confirm we can see only one monitor in the list
      cy.get('tbody > tr').should(($tr) => {
        expect($tr, '1 row').to.have.length(1);
        expect($tr, 'item').to.contain(SAMPLE_MONITOR_WORKFLOW);
      });

      // Wait for 1 minute
      cy.wait(60000);

      // Click Dashboard button to route to Dashboard tab
      cy.get('button').contains('Dashboard').click({ force: true });

      // Confirm we can see the alert is in 'Completed' state
      cy.contains('Completed');
    });
  });

  describe("can be in 'Error' state", () => {
    before(() => {
      cy.deleteAllIndices();
      // modify the JSON object to make an error alert when executing the monitor
      sampleMonitorWithAlwaysTrueTrigger.triggers[0].actions = [
        { name: '', destination_id: '', message_template: { source: '' } },
      ];
      cy.createAndExecuteMonitor(sampleMonitorWithAlwaysTrueTrigger);
    });

    it('by using a wrong destination', () => {
      // Confirm we can see the alert is in 'Error' state
      cy.contains('Error');
    });
  });

  describe("can be in 'Deleted' state", () => {
    before(() => {
      cy.deleteAllIndices();
      cy.createAndExecuteMonitor(sampleMonitorWithAlwaysTrueTrigger);
    });

    it('by deleting the monitor', () => {
      //Confirm there is an active alert
      cy.contains('Active');

      // Click Monitors button to route to Monitors tab
      cy.get('button').contains('Monitors').click({ force: true });

      // Confirm we can see a monitor in the list
      cy.contains(SAMPLE_MONITOR_TO_BE_DELETED);

      // Select checkbox for the existing monitor
      cy.get('input[data-test-subj^="checkboxSelectRow-"]').click({ force: true });

      // Click Actions button to open the actions menu
      cy.contains('Actions').click({ force: true });

      // Click the Delete button
      cy.contains('Delete').click({ force: true });

      // Confirm we can see an empty monitor list
      cy.contains('There are no existing monitors');

      // Click Dashboard button to route to Dashboard tab
      cy.get('button').contains('Dashboard').click({ force: true });

      // Confirm we can see the alert is in 'Deleted' state
      cy.contains('Deleted');
    });
  });
});
