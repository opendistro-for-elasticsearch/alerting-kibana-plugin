## Version 1.12.0.2, 2020-12-09

Compatible with Kibana 7.10.0

### Features
  * Allow for http method selection in custom webhook ([#90](https://github.com/opendistro-for-elasticsearch/alerting-kibana-plugin/pull/90))

### Enhancements
  * Change the position of the plugin in the side bar ([#214](https://github.com/opendistro-for-elasticsearch/alerting-kibana-plugin/pull/214))
  * Remove an unused import after the side bar change ([#216](https://github.com/opendistro-for-elasticsearch/alerting-kibana-plugin/pull/216))
  * Add toast notifications for more backend errors ([#219](https://github.com/opendistro-for-elasticsearch/alerting-kibana-plugin/pull/219))

### Bug Fixes
  * Fix 2 bugs in Anomaly Detection monitor ([#215](https://github.com/opendistro-for-elasticsearch/alerting-kibana-plugin/pull/215))

### Documentation
  * Update release notes for 1.12.0.2 ([#226](https://github.com/opendistro-for-elasticsearch/alerting-kibana-plugin/pull/226))

### Maintenance
  * Add support for Kibana 7.10.0 ([#212](https://github.com/opendistro-for-elasticsearch/alerting-kibana-plugin/pull/212))

### Refactoring
  * Migrate Alerting Kibana plugin to the new Kibana Platform ([#209](https://github.com/opendistro-for-elasticsearch/alerting-kibana-plugin/pull/209))
  * Create a constant for the size of query results used for drop-down menus ([#213](https://github.com/opendistro-for-elasticsearch/alerting-kibana-plugin/pull/213))
  * Remove Kibana icon for the ODFE category in side bar ([#218](https://github.com/opendistro-for-elasticsearch/alerting-kibana-plugin/pull/218))
  * Fix issue that nothing is in 'Time field' dropdown when defining monitors by visual graph after the migration ([#222](https://github.com/opendistro-for-elasticsearch/alerting-kibana-plugin/pull/222))
  * Remove 'JSON.stringify()' from constructing the body of API calls in request handlers ([#223](https://github.com/opendistro-for-elasticsearch/alerting-kibana-plugin/pull/223))
  * Correct variable names of the response for 'getEmailAccount' and 'getEmailGroup' in the request handler  ([#224](https://github.com/opendistro-for-elasticsearch/alerting-kibana-plugin/pull/224))
  * Passing 'core.notifications' to 'Email' and 'EmailRecipients' components ([#225](https://github.com/opendistro-for-elasticsearch/alerting-kibana-plugin/pull/225))
