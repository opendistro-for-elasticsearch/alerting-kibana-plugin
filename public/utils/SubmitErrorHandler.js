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

import { useEffect } from 'react';
/* This function is used to:
 1. call function 'onSubmitError()' when validation fails on submit
 2. auto scroll the page to the first field with error, and focus the field
 Reference: https://github.com/formium/formik/issues/1484 and https://github.com/formium/formik/issues/146 */
export const SubmitErrorHandler = (props) => {
  const errorKeys = Object.keys(props.errors);
  const effect = () => {
    if (errorKeys.length > 0 && !props.isSubmitting && !props.isValid) {
      props.onSubmitError();
      /* Use 2 selectors to locate the input field. Because some <input> elements only have 'name' attribute,
      some <input> only have 'id', but are nested in a <div> with same value in 'name' attribute. */
      const idSelector = `[id="${errorKeys[0]}"]`;
      const nameSelector = `[name="${errorKeys[0]}"]`;
      const errorElement =
        document.querySelector(idSelector) ?? document.querySelector(nameSelector);
      if (errorElement) {
        errorElement.focus();
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };
  useEffect(effect, [props.isSubmitting]);
  return null;
};
