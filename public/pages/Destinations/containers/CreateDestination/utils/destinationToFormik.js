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

import _ from 'lodash';
import { URL_TYPE, CONTENT_TYPE_KEY } from './constants';
import { DESTINATION_TYPE } from '../../../utils/constants';

const getAttributeArrayFromValues = attributes =>
  Object.keys(attributes).map(currentKey => ({
    key: currentKey,
    value: attributes[currentKey],
  }));

const customWebhookToFormik = ({
  query_params: queryParams = {},
  header_params: headerParams = {},
  port,
  url,
  ...rest
}) => {
  const updatedValues = {};
  const { [CONTENT_TYPE_KEY]: contentType, ...otherHeaders } = headerParams;
  updatedValues.headerParams = [
    { key: CONTENT_TYPE_KEY, value: contentType },
    ...getAttributeArrayFromValues(otherHeaders || {}),
  ];
  updatedValues.queryParams = getAttributeArrayFromValues(queryParams);
  updatedValues.port = port === -1 ? null : port;
  updatedValues.urlType = _.isEmpty(url) ? URL_TYPE.ATTRIBUTE_URL : URL_TYPE.FULL_URL;
  return {
    ...rest,
    ...updatedValues,
    url,
  };
};

export const destinationToFormik = values => {
  const updatedValues = { ..._.omit(values, ['id', 'version', 'last_update_time']) };
  if (values.type === DESTINATION_TYPE.CUSTOM_HOOK) {
    const customWebhookValues = customWebhookToFormik(updatedValues[values.type]);
    updatedValues[values.type] = { ...customWebhookValues };
  }
  return updatedValues;
};
