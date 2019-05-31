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

import { DESTINATION_TYPE } from '../../../utils/constants';

const getCustomWebhookValues = ({ queryParams, headerParams, urlType, ...rest }) => {
  const updatedHeaders = headerParams.reduce(
    (acc, { key, value }) => ({
      ...acc,
      [key]: value,
    }),
    {}
  );
  const updatedQueryParams = queryParams.reduce(
    (acc, { key, value }) => ({
      ...acc,
      [key]: value,
    }),
    {}
  );

  return {
    ...rest,
    port: rest.port ? rest.port : -1,
    header_params: updatedHeaders,
    query_params: updatedQueryParams,
  };
};

export const formikToDestination = values => {
  const type = values.type;
  const destinationValues = {
    name: values.name,
    type,
  };
  switch (type) {
    case DESTINATION_TYPE.CUSTOM_HOOK:
      destinationValues[type] = getCustomWebhookValues(values[type]);
      break;
    case DESTINATION_TYPE.SLACK:
    case DESTINATION_TYPE.MAIL:
    case DESTINATION_TYPE.CHIME:
      destinationValues[type] = values[type];
      break;
  }
  return destinationValues;
};
