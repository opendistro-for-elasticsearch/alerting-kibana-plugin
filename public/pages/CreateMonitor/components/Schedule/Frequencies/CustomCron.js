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
import { EuiText, EuiLink, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';

import FormikTextArea from '../../../../../components/FormControls/FormikTextArea/FormikTextArea';
import TimezoneComboBox from './TimezoneComboBox';
import { isInvalid, hasError } from '../../../../../utils/validate';
import { URL } from '../../../../../../utils/constants';

const cronHelpLink = (
  <EuiLink target="_blank" href={URL.DOCUMENTATION}>
    cron expressions
  </EuiLink>
);

const cronHelpText = <EuiText size="s">Use {cronHelpLink} for complex schedules</EuiText>;

const CustomCron = () => (
  <EuiFlexGroup direction="column" style={{ paddingLeft: '10px', marginTop: '5px' }}>
    <EuiFlexItem style={{ marginTop: '0px' }}>
      <FormikTextArea
        name="cronExpression"
        formRow
        rowProps={{
          label: 'Every',
          helpText: cronHelpText,
          isInvalid,
          error: hasError,
          style: { marginTop: '0px' },
        }}
      />
    </EuiFlexItem>
    <EuiFlexItem style={{ marginTop: '0px' }}>
      <TimezoneComboBox />
    </EuiFlexItem>
  </EuiFlexGroup>
);

export default CustomCron;
