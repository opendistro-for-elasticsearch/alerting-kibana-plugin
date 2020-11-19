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
      category: DEFAULT_APP_CATEGORIES.kibana,
      order: 8020,
      mount: async (params) => {
        const { renderApp } = await import('./app');
        const [coreStart] = await core.getStartServices();
        return renderApp(coreStart, params);
      },
    });
    return {};
  }

  start(core) {
    return {};
  }
}
