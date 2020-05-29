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
