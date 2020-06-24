/*
 *   Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import { alerts, destinations, elasticsearch, monitors, detectors } from './server/routes';
import {
  AlertService,
  DestinationsService,
  ElasticsearchService,
  MonitorService,
  AnomalyDetectorService,
} from './server/services';
import { createAlertingCluster, createAlertingADCluster } from './server/clusters';
import { PLUGIN_NAME } from './utils/constants';
import { DEFAULT_APP_CATEGORIES } from '../../src/core/utils';

export default function (kibana) {
  return new kibana.Plugin({
    require: ['elasticsearch'],
    name: PLUGIN_NAME,
    uiExports: {
      app: {
        title: 'Alerting',
        description: 'Kibana Alerting Plugin',
        main: `plugins/${PLUGIN_NAME}/app`,
        icon: `plugins/${PLUGIN_NAME}/images/alerting_icon.svg`,
        category: DEFAULT_APP_CATEGORIES.kibana,
      },

      hacks: [`plugins/${PLUGIN_NAME}/hack`],
    },

    config(Joi) {
      return Joi.object({
        enabled: Joi.boolean().default(true),
      }).default();
    },

    init(server, options) {
      // Create clusters
      createAlertingCluster(server);
      createAlertingADCluster(server);

      // Initialize services
      const esDriver = server.plugins.elasticsearch;
      const alertService = new AlertService(esDriver);
      const elasticsearchService = new ElasticsearchService(esDriver);
      const monitorService = new MonitorService(esDriver);
      const destinationsService = new DestinationsService(esDriver);
      const anomalyDetectorService = new AnomalyDetectorService(esDriver);
      const services = {
        alertService,
        destinationsService,
        elasticsearchService,
        monitorService,
        anomalyDetectorService,
      };

      // Add server routes
      alerts(server, services);
      destinations(server, services);
      elasticsearch(server, services);
      monitors(server, services);
      detectors(server, services);
    },
  });
}
