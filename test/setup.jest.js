/*
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */
import React from 'react';

// https://github.com/elastic/eui/issues/2530
jest.mock('@elastic/eui/lib/components/icon', () => ({
  EuiIcon: () => <div>EuiIconMock</div>,
  __esModule: true,
  IconPropType: require('@elastic/eui/lib/components/icon/icon').IconPropType,
  ICON_TYPES: require('@elastic/eui/lib/components/icon/icon').TYPES,
  ICON_SIZES: require('@elastic/eui/lib/components/icon/icon').SIZES,
  ICON_COLORS: require('@elastic/eui/lib/components/icon/icon').COLORS,
}));

// https://github.com/facebook/jest/issues/5785
// https://github.com/facebook/jest/pull/5267#issuecomment-356605468
beforeEach(() => {
  jest.spyOn(console, 'error');
  console.error.mockImplementation(() => {});
});

afterEach(() => {
  console.error.mockRestore();
});
