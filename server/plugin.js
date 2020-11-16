import { AlertingPluginSetup, AlertingPluginStart } from '.';
import { Plugin, CoreSetup, CoreStart, ILegacyClusterClient } from '../../../src/core/server';
import { Observable } from 'rxjs';
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
import { DEFAULT_HEADERS } from './services/utils/constants';

// init(server, options) {
//   // Create clusters
//   createAlertingCluster(server);
//   createAlertingADCluster(server);
//
//   // Initialize services
//   const esDriver = server.plugins.elasticsearch;
//   const alertService = new AlertService(esDriver);
//   const elasticsearchService = new ElasticsearchService(esDriver);
//   const monitorService = new MonitorService(esDriver);
//   const destinationsService = new DestinationsService(esDriver);
//   const anomalyDetectorService = new AnomalyDetectorService(esDriver);
//   const services = {
//     alertService,
//     destinationsService,
//     elasticsearchService,
//     monitorService,
//     anomalyDetectorService,
//   };
//
//   // Add server routes
//   alerts(server, services);
//   destinations(server, services);
//   elasticsearch(server, services);
//   monitors(server, services);
//   detectors(server, services);
// }

export class AlertingPlugin {
  constructor(initializerContext) {
    this.logger = initializerContext.logger.get();
    this.globalConfig$ = initializerContext.config.legacy.globalConfig$;
  }

  async setup(core) {
    const globalConfig = await this.globalConfig$.pipe(first()).toPromise();

    // Create clusters
    const alertingESClient = createAlertingCluster(core, globalConfig);
    const adESClient = createAlertingADCluster(core, globalConfig);

    // Initialize services
    const alertService = new AlertService(alertingESClient, this.logger);
    const elasticsearchService = new ElasticsearchService(alertingESClient, this.logger);
    const monitorService = new MonitorService(alertingESClient, this.logger);
    const destinationsService = new DestinationsService(alertingESClient, this.logger);
    const anomalyDetectorService = new AnomalyDetectorService(adESClient, this.logger);
    const services = {
      alertService,
      destinationsService,
      elasticsearchService,
      monitorService,
      anomalyDetectorService,
    };

    // create router
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
