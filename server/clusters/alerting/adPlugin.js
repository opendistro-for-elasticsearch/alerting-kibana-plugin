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

import { AD_BASE_API } from '../../services/utils/constants';

export default function alertingADPlugin(Client, config, components) {
  const ca = components.clientAction.factory;

  Client.prototype.alertingAD = components.clientAction.namespaceFactory();
  const alertingAD = Client.prototype.alertingAD.prototype;

  alertingAD.getDetector = ca({
    url: {
      fmt: `${AD_BASE_API}/<%=detectorId%>`,
      req: {
        detectorId: {
          type: 'string',
          required: true,
        },
      },
    },
    method: 'GET',
  });

  alertingAD.searchDetectors = ca({
    url: {
      fmt: `${AD_BASE_API}/_search`,
    },
    needBody: true,
    method: 'POST',
  });
  alertingAD.previewDetector = ca({
    url: {
      fmt: `${AD_BASE_API}/<%=detectorId%>/_preview`,
      req: {
        detectorId: {
          type: 'string',
          required: true,
        },
      },
    },
    needBody: true,
    method: 'POST',
  });
  alertingAD.searchResults = ca({
    url: {
      fmt: `${AD_BASE_API}/results/_search`,
    },
    needBody: true,
    method: 'POST',
  });
}
