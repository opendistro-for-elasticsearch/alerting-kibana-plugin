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

import _ from 'lodash';
import {
  adjustMessageByTrigger,
  adjustMessageForBackend,
  adjustMessageForPreview,
} from './AdjustActionMessage';
import { FORMIK_INITIAL_VALUES } from '../containers/CreateTrigger/utils/constants';
import { FORMIK_INITIAL_ACTION_VALUES } from './constants';

describe('Mustache.js syntax', () => {
  test('".length" can be replaced by ".size"', () => {
    const originStrWithMatch = '{{array.length}} {{ space.length }}';
    const resultStrWithMatch = '{{array.size}} {{ space.size }}';
    const strWithoutMatch =
      'length {array.length} {{length}} {{.length}} {{ .length}} {{length.}} {{.lengthOfArray}}';
    expect(adjustMessageForBackend(originStrWithMatch)).toEqual(resultStrWithMatch);
    expect(adjustMessageForBackend(strWithoutMatch)).toEqual(strWithoutMatch);
  });

  test('leading spaces in sections can be removed', () => {
    const originStrWithMatch = '{{ #object}} {{  #person }} {{  ^box}} {{   /account}}';
    const resultStrWithMatch = '{{#object}} {{#person }} {{^box}} {{/account}}';
    const strWithoutMatch = '{{#.}} { #person} {{ $box}}';
    expect(adjustMessageForBackend(originStrWithMatch)).toEqual(resultStrWithMatch);
    expect(adjustMessageForBackend(strWithoutMatch)).toEqual(strWithoutMatch);
  });
});

describe('Mustache.java syntax', () => {
  test('".size" can be replaced by ".length"', () => {
    const originStrWithMatch = '{{array.size}} {{ space.size }}';
    const resultStrWithMatch = '{{array.length}} {{ space.length }}';
    const strWithoutMatch =
      'size {array.size} {{size}} {{.size}} {{ .size}} {{size.}} {{.sizeOfArray}}';
    expect(adjustMessageForPreview(originStrWithMatch)).toEqual(resultStrWithMatch);
    expect(adjustMessageForPreview(strWithoutMatch)).toEqual(strWithoutMatch);
  });
});

describe('Message templates', () => {
  test('can be modified by trigger', () => {
    const testTrigger = _.cloneDeep(FORMIK_INITIAL_VALUES);
    const testAction = _.cloneDeep(FORMIK_INITIAL_ACTION_VALUES);
    _.set(testAction, 'message_template.source', '{{array.length}}');
    const actions = [testAction];
    _.set(testTrigger, 'actions', actions);
    const expectedResult = _.cloneDeep(testTrigger);
    _.set(expectedResult, 'actions.0.message_template.source', '{{array.size}}');
    adjustMessageByTrigger(testTrigger);
    expect(testTrigger).toEqual(expectedResult);
  });
});
