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

/* Mustache templates have different implementation in different programming languages,
 * thus the way of rendering may vary except for those are defined in the official manual.
 * Alerting Kibana plugin uses 'Mustache.js' while Alerting plugin uses 'Mustache.java' to render templates.
 * The below adjustment for Mustache templates aims to clean up differences between the two render engines
 * for the user when using Alerting Kibana plugin.
 */

import _ from 'lodash';

export const adjustMessageForPreview = (str) =>
  str.replace(/({{\s*[\w\.]+\.)size(\s*}})/g, '$1length$2'); // replace "size" by "length"

export const adjustMessageForBackend = (str) =>
  str
    .replace(/({{)\s*((#|\/|\^)\w[\w\.]*\s*}})/g, '$1$2') // remove leading spaces of sections
    .replace(/({{\s*[\w\.]+\.)length(\s*}})/g, '$1size$2'); // replace "length" by "size"

export const adjustMessageByTrigger = (trigger) => {
  const actions = trigger.actions;
  if (actions && actions.length > 0) {
    return actions.map((action) => adjustMessageByAction(action));
  }
};

export const adjustMessageByAction = (action) => {
  const source = action.message_template.source;
  _.set(action, 'message_template.source', adjustMessageForBackend(source));
};
