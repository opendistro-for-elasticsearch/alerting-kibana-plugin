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

export const API_ROUTE_PREFIX = '/_opendistro/_alerting';
export const MONITOR_BASE_API = `${API_ROUTE_PREFIX}/monitors`;
export const DESTINATION_BASE_API = `${API_ROUTE_PREFIX}/destinations`;
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  'User-Agent': 'Kibana',
};
export const CLUSTER = {
  ADMIN: 'admin',
  ALERTING: 'opendistro_alerting',
  DATA: 'data',
};
