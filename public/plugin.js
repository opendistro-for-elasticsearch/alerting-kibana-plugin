import { DEFAULT_APP_CATEGORIES } from '../../../src/core/public';
import { PLUGIN_NAME } from '../utils/constants';

export class AlertingPlugin {
  constructor(initializerContext) {
    // can retrieve config from initializerContext
  }

  setup(core) {
    core.application.register({
      id: PLUGIN_NAME,
      title: 'Alerting',
      description: 'Kibana Alerting Plugin',
      order: 8020,
      category: DEFAULT_APP_CATEGORIES.kibana,
      mount: async (params) => {
        const { renderApp } = await import('./app');
        const [coreStart, depsStart] = await core.getStartServices();
        return renderApp(coreStart, params);
      },
    });
    return {};
  }

  start(core) {
    return {};
  }
}
