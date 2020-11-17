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
