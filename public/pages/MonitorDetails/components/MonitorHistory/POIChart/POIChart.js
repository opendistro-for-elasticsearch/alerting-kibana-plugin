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
import { EuiFlexGroup } from '@elastic/eui';
import { YAxis, XAxis, AreaSeries, FlexibleWidthXYPlot } from 'react-vis';
import Highlight from '../../../../../components/Charts/Highlight/Highlight';

const POIChart = ({
  data,
  onDragStart,
  onDragEnd,
  xDomain,
  yDomain,
  highlightedArea,
  isLoading,
  isDarkMode,
}) => (
  <EuiFlexGroup
    style={{ paddingLeft: '10%' }}
    justifyContent="center"
    gutterSize="none"
    alignItems="center"
  >
    <FlexibleWidthXYPlot
      height={90}
      margin={{ left: 25, right: 20 }}
      xType="time"
      xDomain={xDomain}
      yDomain={yDomain}
      dontCheckIfEmpty
    >
      <AreaSeries color="darkgray" data={data} curve={'curveStep'} />
      <XAxis left={20} />
      <YAxis tickValues={yDomain} />
      <Highlight
        drag={!isLoading}
        color={isDarkMode ? 'black' : 'white'}
        opacity={0.3}
        enableY={false}
        highlightHeight={50}
        isDarkMode={isDarkMode}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        highlightedArea={{ left: highlightedArea.startTime, right: highlightedArea.endTime }}
      />
    </FlexibleWidthXYPlot>
  </EuiFlexGroup>
);

POIChart.propTypes = {
  highlightedArea: PropTypes.object.isRequired,
  data: PropTypes.array.isRequired,
  onDragStart: PropTypes.func.isRequired,
  onDragEnd: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  xDomain: PropTypes.array.isRequired,
  yDomain: PropTypes.array.isRequired,
  isDarkMode: PropTypes.bool.isRequired,
};

export default POIChart;
