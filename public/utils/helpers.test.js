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

import { backendErrorNotification } from './helpers';
import coreMock from '../../test/mocks/CoreMock';

describe('backendErrorNotification', () => {
  test('can generate error notifications as desired', () => {
    const actionName = 'create';
    const objectName = 'monitor';
    const httpResponse = { ok: false, resp: 'test' };
    const toastProps = {
      text: 'test',
      title: 'Failed to create the monitor',
      toastLifeTimeMs: 20000,
    };
    backendErrorNotification(coreMock.notifications, actionName, objectName, httpResponse);
    expect(coreMock.notifications.toasts.addDanger).toHaveBeenCalledWith(toastProps);
  });
});
