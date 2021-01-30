## Version 1.13.0.0, 2021-01-29

Compatible with Kibana 7.10.2

### Enhancements
  * Add toast notification to handle errors when updating a destination ([#232](https://github.com/opendistro-for-elasticsearch/alerting-kibana-plugin/pull/232))

### Bug Fixes
  * Filter out historical detectors on monitor creation page ([#229](https://github.com/opendistro-for-elasticsearch/alerting-kibana-plugin/pull/229))
  * Fix that Trigger page might freeze for high cardinality detectors ([#230](https://github.com/opendistro-for-elasticsearch/alerting-kibana-plugin/pull/230))
  * Change the query parameters 'size' and 'search' of 'getDestinations' request to be optional ([#231](https://github.com/opendistro-for-elasticsearch/alerting-kibana-plugin/pull/231))

### Documentation
  * Correct the file name of the release notes for 1.12.0.2 ([#228](https://github.com/opendistro-for-elasticsearch/alerting-kibana-plugin/pull/228))

### Maintenance
  * Add Cypress E2E tests and GitHub Action Cypress workflow ([#161](https://github.com/opendistro-for-elasticsearch/alerting-kibana-plugin/pull/161))
  * Fix the unit tests in v1.12.0.2 ([#227](https://github.com/opendistro-for-elasticsearch/alerting-kibana-plugin/pull/227))
  * Add support to run Cypress test in an ODFE cluster with security enabled ([#235](https://github.com/opendistro-for-elasticsearch/alerting-kibana-plugin/pull/235))
  * Upgrade Formik to v2.x to reduce vulnerability ([#236](https://github.com/opendistro-for-elasticsearch/alerting-kibana-plugin/pull/236))
  * Add support for Kibana 7.10.2 ([#239](https://github.com/opendistro-for-elasticsearch/alerting-kibana-plugin/pull/239))

### Refactoring
  * Replace all 'render' props to 'children' props in Formik elements ([#238](https://github.com/opendistro-for-elasticsearch/alerting-kibana-plugin/pull/238))