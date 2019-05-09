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

import alertingPlugin from './alertingPlugin';
import { CLUSTER, DEFAULT_HEADERS } from '../../services/utils/constants';

export default function createAlertingCluster(server) {
  const { customHeaders, ...rest } = server.config().get('elasticsearch');
  server.plugins.elasticsearch.createCluster(CLUSTER.ALERTING, {
    plugins: [alertingPlugin],
    // Currently we are overriding any headers with our own since we explicitly required User-Agent to be Kibana
    // for integration with our backend plugin.
    // TODO: Change our required header to x-<Header> to avoid overriding
    customHeaders: { ...customHeaders, ...DEFAULT_HEADERS },
    ...rest,
  });
}
