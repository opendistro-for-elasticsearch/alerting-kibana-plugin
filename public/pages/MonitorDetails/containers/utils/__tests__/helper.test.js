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

import { migrateTriggerMetadata } from '../helpers';

describe('helpers', () => {
  describe('migrateTriggerMetadata', () => {
    it('should return monitor if no UI metadata', () => {
      expect(migrateTriggerMetadata({ ui_metadata: {} })).toEqual({ ui_metadata: {} });
    });
    it('should return monitor if already migrated', () => {
      expect(migrateTriggerMetadata({ ui_metadata: { triggers: {} } })).toEqual({
        ui_metadata: { triggers: {} },
      });
    });
    it('should migrate metadata ', () => {
      expect(migrateTriggerMetadata({ ui_metadata: { thresholds: { hello: 'world' } } })).toEqual({
        ui_metadata: { triggers: { hello: 'world' } },
      });
    });
    it('should only migrate trigger data and no other data ', () => {
      expect(
        migrateTriggerMetadata({
          key: 'value',
          ui_metadata: { meta: 'meta2', thresholds: { hello: 'world' } },
        })
      ).toEqual({
        key: 'value',
        ui_metadata: { meta: 'meta2', triggers: { hello: 'world' } },
      });
    });
  });
});
