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

import React, { Component, Fragment } from 'react';
import { Field, Formik } from 'formik';
import { hasError, isInvalid, validateDetectorName } from '../../../utils/validate';
import { NAME_REGEX } from '../../../pages/MonitorDetails/containers/utils/helpers.js';

import {
  EuiFlexGrid,
  EuiFlexItem,
  EuiText,
  EuiFormRow,
  EuiButton,
  EuiPageBody,
  EuiSpacer,
  EuiBasicTable,
  EuiTitle,
  EuiFlyoutFooter,
  EuiFlexGroup,
  EuiButtonEmpty,
  EuiFlyoutBody,
  EuiCallOut,
  EuiIcon,
  EuiTextColor,
  EuiPanel,
} from '@elastic/eui';
import ContentPanel from '../../ContentPanel';
import { EuiFlyout } from '@elastic/eui';
import { FormikFieldText } from '../../FormControls';

export function toString(obj) {
  // render calls this method.  During different lifecylces, obj can be undefined
  if (typeof obj != 'undefined') {
    if (obj.hasOwnProperty('period')) {
      let period = obj.period;
      return period.interval + ' ' + period.unit.toLowerCase();
    } else if (typeof obj == 'number') {
      // epoch
      return moment(obj).format('MM/DD/YY hh:mm A');
    }
  }
  return '-';
}

export class FeaturePreview extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const featureAttributes = this.props.featureAttributes;
    const items = [
      {
        name: featureAttributes.feature_name,
        definition: '',
        state: 'Enabled',
      },
    ];
    const columns = [
      {
        field: 'name',
        name: 'Feature name',
      },
      {
        field: 'definition',
        name: 'Feature definition',
        render: () => {
          return (
            <div>
              <p>
                {' '}
                <b>Field:</b> {featureAttributes.fieldName || ''}
              </p>
              <p>
                {' '}
                <b>Aggregation method:</b> {featureAttributes.aggregationType || ''}
              </p>
            </div>
          );
        },
      },
      {
        field: 'state',
        name: 'State',
      },
    ];

    return (
      <EuiFlexGroup direction="column" gutterSize="s">
        <EuiFlexItem>
          <EuiTitle size="s">
            <h3>Features</h3>
          </EuiTitle>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiPanel grow={false}>
            <EuiBasicTable
              items={items}
              columns={columns}
              cellProps={() => {
                return {
                  textOnly: true,
                };
              }}
            />
          </EuiPanel>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }
}

export class FilterDisplay extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    let filter = this.props;
    if (filter === 'all fields are included') {
      return (
        <EuiText>
          <p className="enabled">-</p>
        </EuiText>
      );
    } else {
      return <EuiText>{filter}</EuiText>;
    }
  }
}
const FixedWidthRow = (props) => <EuiFormRow {...props} style={{ width: '150px' }} />;

export function extractIntervalReccomendation(context) {
  if (context.suggestedChanges) {
    if (context.suggestedChanges.detectionIntervalReccomendation) {
      let intervalMinutes =
        Math.ceil(context.suggestedChanges.detectionIntervalReccomendation / 60000) + 1;
      return intervalMinutes + ' minutes';
    }
  }
  return toString(context.adConfigs.detection_interval);
}

export async function createAndStartDetector(context) {
  console.log('adconfig: ' + JSON.stringify(context.adConfigs));
  const configs = context.adConfigs;
  const httpClient = context.httpClient;
  try {
    const response = await httpClient.post('../api/alerting/detectors', {
      configs,
    });
    const {
      data: {
        ok,
        response: { _id },
      },
    } = response;
    const detectorId = _id;
    if (ok) {
      try {
        const response = await httpClient.post(`../api/alerting/detectors/${detectorId}/_start`);
        const {
          data: {
            ok,
            response: { _id },
          },
        } = response;
        console.log('start detector response: ' + JSON.stringify(response));
        if (ok) {
          context.setFlyout(null);
          context.renderDetectorCallOut(_id);
        }
      } catch (err) {
        if (typeof err === 'string') throw err;
        console.log('error from start: ' + JSON.stringify(err));
        throw 'There was a problem starting detector';
      }
    }
  } catch (err) {
    if (typeof err === 'string') throw err;
    console.log('error from create: ' + err);
    throw 'There was a problem createing detector';
  }
}

export function isSuccessCallOut(context) {
  if (
    (!context.failures && !context.suggestedChanges) ||
    (!context.failures && context.suggestedChanges.detectionIntervalReccomendation)
  ) {
    return (
      <EuiCallOut color="success">
        <EuiFlexGroup>
          <EuiFlexItem grow={false}>
            <EuiIcon type="check" />
          </EuiFlexItem>
          <EuiFlexItem>
            {' '}
            <EuiTextColor color="subdued">
              Anomaly Detector configurations have been created and validated, click{' '}
              <i>create detector</i> to confirm creation
            </EuiTextColor>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiCallOut>
    );
  } else {
    return null;
  }
}

export function renderChangedDetectorIntervalCallOut(context) {
  console.log('context: ', context);
  if (context.suggestedChanges.detectionIntervalReccomendation) {
    let intervalMinutes =
      Math.ceil(context.suggestedChanges.detectionIntervalReccomendation / 60000) + 1;
    return (
      <Fragment>
        <EuiCallOut
          title={
            <span>
              The optimal detector interval reccomended was set too
              {' ' + intervalMinutes}.
            </span>
          }
          iconType="alert"
          size="s"
        />
        <EuiSpacer size="s" />
      </Fragment>
    );
  }
  return null;
}

export function isInvalidName(name) {
  if (!NAME_REGEX.test(name)) {
    return 'Valid characters are a-z, A-Z, 0-9, -(hyphen) and _(underscore)';
  }
}
export function handleSubmit(values, formikBag) {
  console.log('values: ', values);
  console.log('formikbag: ', formikBag);
}

export function renderForm(context, httpClient) {
  return (
    <Formik
      initialValues={{ name: context.adConfigs.name }}
      onSubmit={(value) => validateDetector(value, context)}
      validateOnChange={false}
      render={({ handleSubmit, value }) => (
        <Fragment>
          <div style={{ padding: '0px 10px' }}>
            <FormikFieldText
              name="name"
              formRow
              fieldProps={{
                validate: validateDetectorName,
              }}
              rowProps={{
                label: 'Name',
                helpText: 'Specify a unique and descriptive name that is easy to recognize.',
                style: { paddingLeft: '5px' },
                isInvalid,
                error: hasError,
              }}
              inputProps={{
                isInvalid,
                onFocus: (e, field, form) => {
                  form.setFieldError('name', undefined);
                },
              }}
            />
          </div>
          <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
            <EuiFlexItem grow={false}>
              <EuiButton fill color="secondary" onClick={handleSubmit}>
                Validate
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </Fragment>
      )}
    />
  );
}

export async function validateDetector(newValue, context) {
  context.adConfigs.name = newValue.name;
  const configs = context.adConfigs;
  const httpClient = context.httpClient;
  console.log('configs before second validate: ' + JSON.stringify(configs));
  try {
    const response = await httpClient.post('../api/alerting/detectors/_validate', {
      configs,
    });
    console.log('response inside monitordetailssadsad: ' + JSON.stringify(response));
    let resp = _.get(response, 'data.response');
    const {
      data: {
        ok,
        response: { _id },
      },
    } = response;
    console.log('validation resp: ' + JSON.stringify(resp));
    if (ok) {
      console.log('went into okay');
      context.setFlyout(null);
      context.renderFlyout(configs, resp, context.queriesForOverview);
    }
  } catch (err) {
    if (typeof err === 'string') throw err;
    console.log(err);
    throw 'There was a problem validating the configurations';
  }
}

const ConfigCell = (props) => {
  return (
    <FixedWidthRow label={props.title}>
      <EuiText>
        <p className="enabled">{props.description}</p>
      </EuiText>
    </FixedWidthRow>
  );
};

const createDetector = (context) => ({
  flyoutProps: {
    'aria-labelledby': 'createDetectorFlyout',
    maxWidth: 700,
    size: 'm',
  },
  headerProps: { hasBorder: true },
  header: (
    <EuiTitle size="m" style={{ fontSize: '25px' }}>
      <h2>
        <strong>Create Detector</strong>
      </h2>
    </EuiTitle>
  ),
  body: (
    <EuiPageBody component="div">
      <EuiFlyoutBody banner={isSuccessCallOut(context)}>
        {context.failures ? (
          <ContentPanel title="Detector Name Duplicate " titleSize="s">
            {renderForm(context)}
          </ContentPanel>
        ) : (
          <></>
        )}
        {/* <EuiFlyoutBody banner={!context.failures && !context.suggestedChanges ? {callOut} : {}}> */}
        <EuiSpacer size="l" />
        {context.suggestedChanges ? renderChangedDetectorIntervalCallOut(context) : null}
        <ContentPanel title="Detector Configuration Preview" titleSize="s">
          <EuiFlexGrid columns={2} gutterSize="l" style={{ border: 'none' }}>
            <EuiFlexItem>
              <ConfigCell title="Name" description={context.adConfigs.name} />
            </EuiFlexItem>
            <EuiFlexItem>
              <ConfigCell title="Description" description={context.adConfigs.description} />
            </EuiFlexItem>
            <EuiFlexItem>
              <ConfigCell title="Data source index" description={context.adConfigs.indices} />
            </EuiFlexItem>
            <EuiFlexItem>
              <ConfigCell
                title="Detector interval"
                description={extractIntervalReccomendation(context)}
              />
            </EuiFlexItem>
            <EuiFlexItem>
              <ConfigCell
                title="Window delay"
                description={toString(context.adConfigs.window_delay)}
              />
            </EuiFlexItem>
            <EuiFlexItem>
              <ConfigCell
                title="Data filter"
                description={context.queriesForOverview.filter_query}
              />
            </EuiFlexItem>
          </EuiFlexGrid>
          <EuiSpacer />
          <FeaturePreview featureAttributes={context.queriesForOverview.feature_attributes} />
        </ContentPanel>
      </EuiFlyoutBody>
    </EuiPageBody>
  ),
  footerProps: {},
  footer: (
    <EuiFlyoutFooter>
      <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
        <EuiFlexItem grow={false}>
          <EuiButtonEmpty onClick={() => context.setFlyout(null)}>Cancel</EuiButtonEmpty>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton flush="right" onClick={() => createAndStartDetector(context)} fill>
            Create Detector
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiFlyoutFooter>
  ),
});

export default createDetector;
