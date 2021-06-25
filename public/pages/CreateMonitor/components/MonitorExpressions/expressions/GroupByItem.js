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
import { GroupByPopover } from './index';

export default function GroupByItem(
  { values, onMadeChanges, arrayHelpers, fieldOptions, expressionWidth, groupByItem, index } = this
    .props
) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(groupByItem === '');
  const closePopover = () => setIsPopoverOpen(false);

  return (
    <EuiPopover
      id="groupBy-badge-popover"
      button={
        <div>
          <EuiBadge
            iconSide="right"
            iconType="cross"
            iconOnClick={() => arrayHelpers.remove(index)}
            iconOnClickAriaLabel="Remove group by"
            onClick={() => {
              setIsPopoverOpen(true);
            }}
            onClickAriaLabel="Edit group by"
          >
            {groupByItem}
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
      <GroupByPopover
        values={values}
        onMadeChanges={onMadeChanges}
        arrayHelpers={arrayHelpers}
        options={fieldOptions}
        closePopover={closePopover}
        expressionWidth={expressionWidth}
        index={index}
      />
    </EuiPopover>
  );
}
