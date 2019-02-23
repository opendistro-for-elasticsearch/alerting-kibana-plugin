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
import { connect } from 'formik';

import CustomCron from './CustomCron';
import Daily from './Daily';
import Interval from './Interval';
import Monthly from './Monthly';
import Weekly from './Weekly';

const components = {
  daily: Daily,
  weekly: Weekly,
  monthly: Monthly,
  cronExpression: CustomCron,
  interval: Interval,
};

const FrequencyPicker = props => {
  const type = props.formik.values.frequency;
  const Component = components[type];
  return <Component />;
};

export default connect(FrequencyPicker);
