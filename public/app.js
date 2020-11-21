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

import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router, Route } from 'react-router-dom';

import 'react-vis/dist/style.css';
// TODO: review the CSS style and migrate the necessary style to SASS, as Less is not supported in Kibana "new platform" anymore
// import './less/main.less';
import Main from './pages/Main';
import { CoreContext } from './utils/CoreContext';

export function renderApp(coreStart, params) {
  const isDarkMode = coreStart.uiSettings.get('theme:darkMode') || false;
  coreStart.chrome.setBreadcrumbs([{ text: 'Alerting' }]); // Set Breadcrumbs for the plugin

  // Load Chart's dark mode CSS
  if (isDarkMode) {
    require('@elastic/charts/dist/theme_only_dark.css');
  } else {
    require('@elastic/charts/dist/theme_only_light.css');
  }

  // render react to DOM
  ReactDOM.render(
    <Router>
      <CoreContext.Provider
        value={{ http: coreStart.http, isDarkMode, notifications: coreStart.notifications }}
      >
        <Route render={(props) => <Main title="Alerting" {...props} />} />
      </CoreContext.Provider>
    </Router>,
    params.element
  );
  return () => ReactDOM.unmountComponentAtNode(params.element);
}
