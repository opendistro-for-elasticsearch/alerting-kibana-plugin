import { get, isEmpty } from 'lodash';
export const migrateTriggerMetadata = monitor => {
  const uiMetadata = get(monitor, 'ui_metadata', {});
  if (isEmpty(uiMetadata)) return monitor;
  // Already migrated no need to perform any action
  if (uiMetadata.triggers) return monitor;
  const { thresholds = {}, ...rest } = uiMetadata;
  return {
    ...monitor,
    ui_metadata: {
      ...rest,
      triggers: {
        ...thresholds,
      },
    },
  };
};
