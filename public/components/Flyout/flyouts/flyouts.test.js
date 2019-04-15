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
import Flyouts from './index';

describe('Flyouts.message', () => {
  test('generates message JSON', () => {
    const json = Flyouts.message();
    expect(json).toMatchSnapshot();
  });
});

describe('Flyouts.messageFrequency', () => {
  test('generates message JSON', () => {
    const json = Flyouts.messageFrequency();
    expect(json).toMatchSnapshot();
  });
});

describe('Flyouts.triggerCondition', () => {
  test('generates message JSON', () => {
    const json = Flyouts.triggerCondition({});
    expect(json).toMatchSnapshot();
  });
});
