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
