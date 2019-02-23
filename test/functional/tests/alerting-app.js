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

import expect from 'expect';

export default function({ getService, getPageObjects }) {
  // most test files will start off by loading some services
  const find = getService('find');
  const testSubjects = getService('testSubjects');
  const esArchiver = getService('esArchiver');

  const PageObjects = getPageObjects(['alertingCommon']);

  describe('Alerting Application', () => {
    before(async () => {
      await PageObjects.alertingCommon.navigate();
    });

    it('should show alerting dashboard on navigation', async () => {
      const allTexts = await testSubjects.getVisibleTextAll('appLink');
      expect(allTexts.includes('A\nAlerting')).toBe(true);
    });

    it('should navigate to Monitoring Page', async () => {
      await PageObjects.alertingCommon.navigateToMonitor();
      const currentBreadCrumb = await find.byCssSelector('.euiBreadcrumb--last');
      const currentBreadCrumbText = await currentBreadCrumb.getVisibleText();
      expect(currentBreadCrumbText).toBe('Monitors');
    });
  });
}
