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

import { first } from 'rxjs/operators';
import { createAlertingCluster, createAlertingADCluster } from './clusters';
import {
  AlertService,
  DestinationsService,
  ElasticsearchService,
  MonitorService,
  AnomalyDetectorService,
} from './services';
import { alerts, destinations, elasticsearch, monitors, detectors } from '../server/routes';

export class AlertingPlugin {
  constructor(initializerContext) {
    this.logger = initializerContext.logger.get();
    this.globalConfig$ = initializerContext.config.legacy.globalConfig$;
  }

  async setup(core) {
    // Get the global configuration settings of the cluster
    const globalConfig = await this.globalConfig$.pipe(first()).toPromise();

    // Create clusters
    const alertingESClient = createAlertingCluster(core, globalConfig);
    const adESClient = createAlertingADCluster(core, globalConfig);

    // Initialize services
    const alertService = new AlertService(alertingESClient);
    const elasticsearchService = new ElasticsearchService(alertingESClient);
    const monitorService = new MonitorService(alertingESClient);
    const destinationsService = new DestinationsService(alertingESClient);
    const anomalyDetectorService = new AnomalyDetectorService(adESClient);
    const services = {
      alertService,
      destinationsService,
      elasticsearchService,
      monitorService,
      anomalyDetectorService,
    };

    // Create router
    const router = core.http.createRouter();
    // Add server routes
    alerts(services, router);
    destinations(services, router);
    elasticsearch(services, router);
    monitors(services, router);
    detectors(services, router);

    return {};
  }

  async start(core) {
    return {};
  }
}
