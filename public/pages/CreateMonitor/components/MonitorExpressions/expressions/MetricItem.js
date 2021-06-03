/*
 *   Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import React, { useState } from 'react';
import { EuiPopover, EuiBadge } from '@elastic/eui';
import MetricPopover from './MetricPopover';

export default function MetricItem(
  { values, onMadeChanges, arrayHelpers, fieldOptions, expressionWidth, aggregation, index } = this
    .props
) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(aggregation.fieldName === '');
  const closePopover = () => setIsPopoverOpen(false);

  // TODO: Commenting this out for now since the 'count_of_all_documents` metric is malformed
  //The first metric is read only
  // if (index == 0)
  //   return (
  //     <EuiBadge>
  //       {aggregation.aggregationType} of {aggregation.fieldName}
  //     </EuiBadge>
  //   );

  return (
    <EuiPopover
      id="metric-badge-popover"
      button={
        <div>
          <EuiBadge
            iconSide="right"
            iconType="cross"
            iconOnClick={() => arrayHelpers.remove(index)}
            iconOnClickAriaLabel="Remove metric"
            onClick={() => {
              //TODO: Set options to the current agg values

              setIsPopoverOpen(true);
            }}
            onClickAriaLabel="Edit metric"
          >
            {aggregation.aggregationType} of {aggregation.fieldName}
          </EuiBadge>
        </div>
      }
      isOpen={isPopoverOpen}
      closePopover={closePopover}
      panelPaddingSize="none"
      ownFocus
      withTitle
      anchorPosition="downLeft"
    >
      <MetricPopover
        values={values}
        onMadeChanges={onMadeChanges}
        arrayHelpers={arrayHelpers}
        options={fieldOptions}
        closePopover={closePopover}
        expressionWidth={expressionWidth}
        aggregation={aggregation}
        index={index}
      />
    </EuiPopover>
  );
}
