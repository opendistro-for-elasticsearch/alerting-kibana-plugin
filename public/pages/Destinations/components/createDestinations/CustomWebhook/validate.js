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

import { URL_TYPE } from '../../../containers/CreateDestination/utils/constants';

export const validateUrl = (value, allValues) => {
  const type = allValues.type;
  if (allValues[type].urlType !== URL_TYPE.FULL_URL) return;
  if (!value) return 'Required';
  const isValidUrl = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/.test(
    value
  );
  if (!isValidUrl) return 'Invalid URL';
};

export const validateHost = (value, allValues) => {
  const type = allValues.type;
  if (allValues[type].urlType !== URL_TYPE.ATTRIBUTE_URL) return;
  if (!value) return 'Required';
  const isValidUrl = /^(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/.test(
    value
  );
  if (!isValidUrl) return 'Invalid Host';
};
