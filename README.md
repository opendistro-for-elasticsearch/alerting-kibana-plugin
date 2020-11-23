# Open Distro for Elasticsearch Alerting Kibana

The Open Distro for Elasticsearch Alerting Kibana plugin lets you manage your [Open Distro for Elasticsearch alerting plugin](https://github.com/opendistro-for-elasticsearch/alerting) to monitor your data and send notifications when certain criteria are met---all from Kibana.


## Highlights

- Create and schedule *monitors*, which run period queries against data in Elasticsearch.
- Evaluate query results against *triggers* to see if they meet certain criteria.
- If trigger criteria are met, generate *alerts* and perform *actions* (e.g. post a message in a Slack channel).


## Documentation

Please see our [documentation](https://opendistro.github.io/for-elasticsearch-docs/).


## Setup

1. Download Elasticsearch for the version that matches the [Kibana version specified in package.json](./package.json#L9).
1. Download and install the appropriate [Open Distro for Elasticsearch Alerting plugin](https://github.com/opendistro-for-elasticsearch/alerting).
1. Download the Kibana source code for the [version specified in package.json](./package.json#L9) you want to set up.

   See the [Kibana contributing guide](https://github.com/elastic/kibana/blob/master/CONTRIBUTING.md#setting-up-your-development-environment) for more instructions on setting up your development environment.

1. Change your node version to the version specified in `.node-version` inside the Kibana root directory.
1. cd into the `plugins` directory of the Kibana source code directory.
1. Check out this package from version control into the `plugins` directory.
1. Run `yarn kbn bootstrap` inside `kibana/plugins/alerting-kibana-plugin`.

Ultimately, your directory structure should look like this:

```md
.
├── kibana
│   └── plugins
│       └── alerting-kibana-plugin
```


## Build

To build the plugin's distributable zip simply run `yarn build`.

Example output: `./build/opendistroAlertingKibana-1.12.0.0.zip`


## Run

- `yarn start`

  Starts Kibana and includes this plugin. Kibana will be available on `localhost:5601`.
  Please run in the Kibana root directory.

- `yarn test:jest`

  Runs the plugin tests.


## Contributing to Open Distro for Elasticsearch Alerting Kibana

- Refer to [CONTRIBUTING.md](./CONTRIBUTING.md).
- Since this is a Kibana plugin, it can be useful to review the [Kibana contributing guide](https://github.com/elastic/kibana/blob/master/CONTRIBUTING.md) alongside the documentation around [Kibana plugins](https://www.elastic.co/guide/en/kibana/master/kibana-plugins.html) and [plugin development](https://www.elastic.co/guide/en/kibana/master/external-plugin-development.html).



## License

This code is licensed under the Apache 2.0 License.

## Copyright

Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.

