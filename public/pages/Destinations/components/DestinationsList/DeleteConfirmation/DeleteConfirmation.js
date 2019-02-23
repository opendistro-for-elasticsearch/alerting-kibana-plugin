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
import PropTypes from 'prop-types';

import { EuiConfirmModal, EuiOverlayMask, EUI_MODAL_CANCEL_BUTTON } from '@elastic/eui';

const propTypes = {
  isVisible: PropTypes.bool.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

const DeleteConfirmation = ({ isVisible, onConfirm, onCancel }) => {
  return isVisible ? (
    <EuiOverlayMask>
      <EuiConfirmModal
        title="Delete this destination?"
        onCancel={onCancel}
        onConfirm={onConfirm}
        cancelButtonText="No"
        confirmButtonText="Yes"
        buttonColor="danger"
        defaultFocusedButton={EUI_MODAL_CANCEL_BUTTON}
      />
    </EuiOverlayMask>
  ) : null;
};

DeleteConfirmation.propTypes = propTypes;

export default DeleteConfirmation;
