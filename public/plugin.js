// import { DEFAULT_APP_CATEGORIES } from '../../src/core';
import { PLUGIN_NAME } from './utils/constants';

export class AlertingPlugin {
  constructor(initializerContext) {
    // can retrieve config from initializerContext
  }

  setup(core) {
    core.application.register({
      id: 'alerting',
      title: 'Alerting',
      description: 'Kibana Alerting Plugin',
      // main: `plugins/${PLUGIN_NAME}/app`,
      // icon: `plugins/${PLUGIN_NAME}/images/alerting_icon.svg`,
      order: 8020,
      mount: async (params) => {
        const { renderApp } = await import('./app');
        const [coreStart, depsStart] = await core.getStartServices();
        return renderApp(coreStart, params);
      },
      // category: DEFAULT_APP_CATEGORIES.kibana,
    });
    return {};
  }

  start(core) {
    return {};
  }
}
