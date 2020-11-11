import { AlertingPluginSetup, AlertingPluginStart } from '.';
import { Plugin, CoreSetup, CoreStart, ILegacyClusterClient } from '../../../src/core/server';
import alertingPlugin from './clusters/alerting/alertingPlugin';
import adPlugin from './clusters/alerting/adPlugin';
import {
  AlertService,
  DestinationsService,
  ElasticsearchService,
  MonitorService,
  AnomalyDetectorService,
} from './services';
import { alerts, destinations, elasticsearch, monitors, detectors } from '../server/routes';

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
  async setup(core) {
    // create Elasticsearch client that aware of ISM API endpoints
    const esDriver = core.elasticsearch.legacy.createClient('alerting', {
      plugins: [alertingPlugin, adPlugin],
    });

    // Initialize services
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
