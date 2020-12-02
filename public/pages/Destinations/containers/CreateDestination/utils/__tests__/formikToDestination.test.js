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

import { formikToDestination } from '../formikToDestination';
import { DESTINATION_TYPE } from '../../../../utils/constants';

describe('formikToDestination', () => {
  const baseDestination = {
    name: 'testing webhook',
  };
  test('should able to build chime destination', () => {
    expect(
      formikToDestination({
        ...baseDestination,
        type: DESTINATION_TYPE.CHIME,
        [DESTINATION_TYPE.CHIME]: { url: 'https://chime.webhook' },
      })
    ).toMatchSnapshot();
  });
  test('should able to build slack destination', () => {
    expect(
      formikToDestination({
        ...baseDestination,
        type: DESTINATION_TYPE.SLACK,
        [DESTINATION_TYPE.SLACK]: { url: 'https://chime.webhook' },
      })
    ).toMatchSnapshot();
  });
  test('should able to build custom destination', () => {
    expect(
      formikToDestination({
        ...baseDestination,
        type: DESTINATION_TYPE.CUSTOM_HOOK,
        [DESTINATION_TYPE.CUSTOM_HOOK]: {
          url: 'https://custom.webhook',
          method: 'PUT',
          queryParams: [
            {
              key: 'key1',
              value: 'value1',
            },
            {
              key: 'key2',
              value: 'value2',
            },
          ],
          headerParams: [
            {
              key: 'Content-Type',
              value: 'application/json',
            },
            {
              key: 'headerKey1',
              value: 'Header Value1',
            },
            {
              key: 'headerKey2',
              value: 'Header Value2',
            },
          ],
        },
      })
    ).toMatchSnapshot();
  });
});
