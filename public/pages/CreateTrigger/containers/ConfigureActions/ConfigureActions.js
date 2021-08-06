/*
 * Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
import _ from 'lodash';
import { EuiFormRow, EuiPanel, EuiText } from '@elastic/eui';
import Action from '../../components/Action';
import ActionEmptyPrompt from '../../components/ActionEmptyPrompt';
import AddActionButton from '../../components/AddActionButton';
import { DEFAULT_MESSAGE_SOURCE, FORMIK_INITIAL_ACTION_VALUES } from '../../utils/constants';
import { DESTINATION_OPTIONS } from '../../../Destinations/utils/constants';
import { getAllowList } from '../../../Destinations/utils/helpers';
import { MAX_QUERY_RESULT_SIZE, MONITOR_TYPE } from '../../../../utils/constants';
import { backendErrorNotification } from '../../../../utils/helpers';
import { TRIGGER_TYPE } from '../CreateTrigger/utils/constants';
import { formikToTrigger } from '../CreateTrigger/utils/formikToTrigger';

const createActionContext = (context, action) => ({
  ctx: {
    ...context,
    action,
  },
});

class ConfigureActions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      destinations: [],
      allowList: [],
      loadingDestinations: true,
      actionDeleted: false,
    };
  }

  async componentDidMount() {
    const { httpClient } = this.props;

    const allowList = await getAllowList(httpClient);
    this.setState({ allowList });

    this.loadDestinations();
  }

  loadDestinations = async (searchText = '') => {
    const { httpClient, values, arrayHelpers, notifications, fieldPath } = this.props;
    const { allowList, actionDeleted } = this.state;
    this.setState({ loadingDestinations: true });
    const getDestinationLabel = (destination) => {
      const foundDestination = DESTINATION_OPTIONS.find(({ value }) => value === destination.type);
      if (foundDestination) return foundDestination.text;
      return destination.type;
    };
    try {
      const response = await httpClient.get('../api/alerting/destinations', {
        query: { search: searchText, size: MAX_QUERY_RESULT_SIZE },
      });
      if (response.ok) {
        const destinations = response.destinations
          .map((destination) => ({
            label: `${destination.name} - (${getDestinationLabel(destination)})`,
            value: destination.id,
            type: destination.type,
          }))
          .filter(({ type }) => allowList.includes(type));
        this.setState({ destinations, loadingDestinations: false });

        const monitorType = _.get(
          arrayHelpers,
          'form.values.monitor_type',
          MONITOR_TYPE.QUERY_LEVEL
        );
        const initialActionValues = _.cloneDeep(FORMIK_INITIAL_ACTION_VALUES);
        switch (monitorType) {
          case MONITOR_TYPE.BUCKET_LEVEL:
            _.set(
              initialActionValues,
              'message_template.source',
              DEFAULT_MESSAGE_SOURCE.BUCKET_LEVEL_MONITOR
            );
            break;
          case MONITOR_TYPE.QUERY_LEVEL:
            _.set(
              initialActionValues,
              'message_template.source',
              DEFAULT_MESSAGE_SOURCE.QUERY_LEVEL_MONITOR
            );
            break;
        }

        // If actions is not defined  If user choose to delete actions, it will not override customer's preferences.
        if (destinations.length > 0 && !_.get(values, `${fieldPath}actions`) && !actionDeleted) {
          arrayHelpers.insert(0, initialActionValues);
        }
      } else {
        backendErrorNotification(notifications, 'load', 'destinations', response.err);
      }
    } catch (err) {
      console.error(err);
      this.setState({ destinations: [], loadingDestinations: false });
    }
  };

  sendTestMessage = async (index) => {
    const {
      context: { monitor },
      httpClient,
      notifications,
      triggerIndex,
      values,
    } = this.props;
    // TODO: For bucket-level triggers, sendTestMessage will only send a test message if there is
    //  at least one bucket of data from the monitor input query.
    let testTrigger = _.cloneDeep(formikToTrigger(values, monitor.ui_metadata)[triggerIndex]);
    let action;
    let condition;

    switch (monitor.monitor_type) {
      case MONITOR_TYPE.BUCKET_LEVEL:
        action = _.get(testTrigger, `${TRIGGER_TYPE.BUCKET_LEVEL}.actions[${index}]`);
        condition = {
          ..._.get(testTrigger, `${TRIGGER_TYPE.BUCKET_LEVEL}.condition`),
          buckets_path: { _count: '_count' },
          script: {
            source: 'params._count >= 0',
          },
        };
        _.set(testTrigger, `${TRIGGER_TYPE.BUCKET_LEVEL}.actions`, [action]);
        _.set(testTrigger, `${TRIGGER_TYPE.BUCKET_LEVEL}.condition`, condition);
        break;
      case MONITOR_TYPE.QUERY_LEVEL:
        action = _.get(testTrigger, `actions[${index}]`);
        condition = {
          ..._.get(testTrigger, 'condition'),
          script: { lang: 'painless', source: 'return true' },
        };
        _.set(testTrigger, 'actions', [action]);
        _.set(testTrigger, 'condition', condition);
        break;
    }

    const testMonitor = { ...monitor, triggers: [{ ...testTrigger }] };

    try {
      const response = await httpClient.post('../api/alerting/monitors/_execute', {
        query: { dryrun: false },
        body: JSON.stringify(testMonitor),
      });
      if (!response.ok) {
        console.error('There was an error trying to send test message', response.resp);
        backendErrorNotification(notifications, 'send', 'test message', response.resp);
      }
    } catch (err) {
      console.error('There was an error trying to send test message', err);
    }
  };

  renderActions = (arrayHelpers) => {
    const { context, setFlyout, values, fieldPath } = this.props;
    const { destinations } = this.state;
    const hasDestinations = !_.isEmpty(destinations);
    const hasActions = !_.isEmpty(_.get(values, `${fieldPath}actions`));
    const shouldRenderActions = hasActions || (hasDestinations && hasActions);

    return shouldRenderActions ? (
      _.get(values, `${fieldPath}actions`).map((action, index) => (
        <Action
          key={index}
          action={action}
          arrayHelpers={arrayHelpers}
          context={createActionContext(context, action)}
          destinations={destinations}
          index={index}
          onDelete={() => {
            this.setState({ actionDeleted: true });
            arrayHelpers.remove(index);
          }}
          sendTestMessage={this.sendTestMessage}
          setFlyout={setFlyout}
          fieldPath={fieldPath}
          values={values}
        />
      ))
    ) : (
      <ActionEmptyPrompt arrayHelpers={arrayHelpers} hasDestinations={hasDestinations} />
    );
  };

  render() {
    const { loadingDestinations } = this.state;
    const { arrayHelpers, values, fieldPath } = this.props;
    const numOfActions = _.get(values, `${fieldPath}actions`, []).length;
    const displayAddActionButton = numOfActions > 0;
    //TODO:: Handle loading Destinations inside the Action which will be more intuitive for customers.
    return (
      <div style={{ paddingLeft: '20px', paddingRight: '15px' }}>
        <EuiFormRow
          helpText={'Define actions when trigger conditions are met.'}
          style={{ paddingBottom: '5px' }}
        >
          <EuiText>
            <h4>{`Actions (${numOfActions})`}</h4>
          </EuiText>
        </EuiFormRow>
        <EuiPanel style={{ backgroundColor: '#F7F7F7', padding: '20px' }}>
          {loadingDestinations ? (
            <div style={{ display: 'flex', justifyContent: 'center' }}>Loading Destinations...</div>
          ) : (
            this.renderActions(arrayHelpers)
          )}

          {displayAddActionButton ? (
            <div style={{ paddingBottom: '5px', paddingTop: '20px' }}>
              <AddActionButton arrayHelpers={arrayHelpers} numOfActions={numOfActions} />
            </div>
          ) : null}
        </EuiPanel>
      </div>
    );
  }
}

export default ConfigureActions;
