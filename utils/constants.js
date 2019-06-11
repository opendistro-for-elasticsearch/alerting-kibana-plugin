export const OPEN_DISTRO_PREFIX = 'opendistro';

export const PLUGIN_NAME = `${OPEN_DISTRO_PREFIX}-alerting`;
export const INDEX_PREFIX = `${OPEN_DISTRO_PREFIX}-alerting`;
export const INDEX = {
  SCHEDULED_JOBS: `.${INDEX_PREFIX}-config`,
  ALERTS: `.${INDEX_PREFIX}-alerts`,
  ALL_ALERTS: `.${INDEX_PREFIX}-alert*`,
  ALERT_HISTORY_WRITE: `.${INDEX_PREFIX}-alert-history-write`,
};

export const URL = {
  MUSTACHE: 'https://mustache.github.io/mustache.5.html',
  DOCUMENTATION: 'https://opendistro.github.io/for-elasticsearch-docs/docs/alerting/',
};

export const MAX_THROTTLE_VALUE = 1440;
export const WRONG_THROTTLE_WARNING =
  'Throttle value must be greater than 0 and less than ' + MAX_THROTTLE_VALUE;
