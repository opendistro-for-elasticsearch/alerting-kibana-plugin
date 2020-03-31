## Version 1.6.0.0, 2020-03-27

### New Features
  * Adds support for Kibana 7.6.1 - [PR #118](https://github.com/opendistro-for-elasticsearch/alerting-kibana-plugin/pull/118)

## Version 1.4.0.0, 2020-01-13

### New Features
  * Adds support for Kibana 7.4.2 - [PR #113](https://github.com/opendistro-for-elasticsearch/alerting-kibana-plugin/pull/113)

## Version 1.3.0.0, 2019-11-20

### New Features
  * Adds support for Kibana 7.3.2 - [PR #109](https://github.com/opendistro-for-elasticsearch/alerting-kibana-plugin/pull/109)

## Version 1.2.0.0, 2019-09-20

### New Features
  * Adds support for Kibana 7.2.0 - [PR #81](https://github.com/opendistro-for-elasticsearch/alerting-kibana-plugin/pull/81)

### Bug fixes
  * Fixes update monitor from monitor list - [PR #64](https://github.com/opendistro-for-elasticsearch/alerting-kibana-plugin/pull/64)
  * Added support for IPv4 and IPv6 on URL validation - [PR #67](https://github.com/opendistro-for-elasticsearch/alerting-kibana-plugin/pull/67)
  * Disables the query parameter box in Custom webhook - [PR #72](https://github.com/opendistro-for-elasticsearch/alerting-kibana-plugin/pull/72)
  * Fixes invalid value for new parameters and headers on Custom Destination - [PR #73](https://github.com/opendistro-for-elasticsearch/alerting-kibana-plugin/pull/73)
  * Fixes URL parameters to fetch destinations on creation of trigger UI - [PR #75](https://github.com/opendistro-for-elasticsearch/alerting-kibana-plugin/pull/75)

## Version 1.1.0.0, 2019-07-30

### New Features
 * Adds support for Kibana 7.1.1

### Bug fixes
 * Enhanced message for trigger execution [Alerting #58](https://github.com/opendistro-for-elasticsearch/alerting/issues/14)

## Version 1.0.0.0, 2019-06-28

### New Features
  * Adds support for ES and Kibana 7.0.1 - [PR #44](https://github.com/opendistro-for-elasticsearch/alerting-kibana-plugin/pull/44)
  * Visual monitors allows to specify where criteria - [PR #42](https://github.com/opendistro-for-elasticsearch/alerting-kibana-plugin/pull/42)
  * Enables throttling on actions - [PR #45](https://github.com/opendistro-for-elasticsearch/alerting-kibana-plugin/pull/78)

### Bug fixes
  * Fixes doc links - [PR #50](https://github.com/opendistro-for-elasticsearch/alerting-kibana-plugin/pull/50)
  * Updated text for visual monitor - [PR #47](https://github.com/opendistro-for-elasticsearch/alerting-kibana-plugin/pull/47)

## Version 0.10.0.0, 2019-08-07

### New Features
  * Adds support for Kibana 6.8.1 - [PR #78](https://github.com/opendistro-for-elasticsearch/alerting-kibana-plugin/pull/78)

## Version 0.9.0.0, 2019-04-24

### New Features
 * Adds support for Kibana 6.7.1

## Version 0.8.0.0, 2019-04-02

### New Features
  * Adds support for Kibana 6.6.2 - [PR #7](https://github.com/opendistro-for-elasticsearch/alerting-kibana-plugin/pull/7)

### Bug fixes
  * Fixes sorting on Destination Type on destinations list page.

## Version 0.7.0.0, 2019-01-31

### New Features

This is the first release of the OpenDistro Kibana Alerting plugin.

Allows users to create and schedule **monitors** to run periodic queries of data in Elasticsearch.
Results of periodic queries are evaluated against the monitor's **triggers** to see if they meet certain criteria.
If criteria is met, **alerts** are generated and saved in an Elasticsearch index and the user is notified by the trigger's **actions**.
Actions are messages using mustache templating created by the user that are sent to **destinations**.
Destinations are locations where action messages are sent, such as slack, chime, or custom webhooks.
Alerts can be acknowledged to mute notifications.

### Commits

* [[`475a70e`](https://github.com/opendistro-for-elasticsearch/alerting-kibana-plugin/commit/475a70eedece077ff6c5c1133b143f69d49eb105)] Initial release for OpenDistro Kibana Alerting

