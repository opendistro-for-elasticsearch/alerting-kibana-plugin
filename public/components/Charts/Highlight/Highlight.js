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

/*
  This file has been cloned and modified from the original source(https://github.com/uber/react-vis/blob/35c8950722e9ad60214399291eda731ac31af267/src/plot/highlight.js) due to its limitations.
  We should revert this to an Actual Highlight Component from react-vis when it is ready for use with
  Controlled Highlight, allow only Drag and not to rebrush.
  * Removes capability for brushing on Area
  * Adds capability for dragging on chart
  * Styles Component as per the our mocks
*/

import React from 'react';
import { ScaleUtils, AbstractSeries } from 'react-vis';
import { isEqual } from 'lodash';
import PropTypes from 'prop-types';

const getLocs = evt => {
  const targetBounding = evt.currentTarget.getBoundingClientRect();
  const offsetX = evt.clientX - targetBounding.left;
  const offsetY = evt.clientY - targetBounding.top;
  return {
    xLoc: offsetX,
    yLoc: offsetY,
  };
};

class Highlight extends AbstractSeries {
  constructor(props) {
    super(props);
    this.state = {
      dragging: false,
      brushArea: { bottom: 0, right: 0, left: 0, top: 0 },
      brushing: false,
      startLocX: 0,
      startLocY: 0,
      dragArea: null,
    };
  }

  componentDidMount() {
    const { highlightRef } = this.props;
    if (highlightRef) {
      highlightRef({
        setHighlightedArea: this.setHighlightedArea,
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(this.props, prevProps)) {
      this.setHighlightedArea({
        ...this.props.highlightedArea,
      });
    }
  }

  _getDrawArea(xLoc, yLoc) {
    const { startLocX, startLocY } = this.state;
    const {
      enableX,
      enableY,
      highlightWidth,
      highlightHeight,
      innerWidth,
      innerHeight,
      marginLeft,
      marginRight,
      marginBottom,
      marginTop,
    } = this.props;
    const plotHeight = innerHeight + marginTop + marginBottom;
    const plotWidth = innerWidth + marginLeft + marginRight;
    const touchWidth = highlightWidth || plotWidth;
    const touchHeight = highlightHeight || plotHeight;

    return {
      bottom: enableY ? Math.max(startLocY, yLoc) : touchHeight,
      right: enableX ? Math.max(startLocX, xLoc) : touchWidth,
      left: enableX ? Math.min(xLoc, startLocX) : 0,
      top: enableY ? Math.min(yLoc, startLocY) : 0,
    };
  }

  _getDragArea(xLoc, yLoc) {
    const { enableX, enableY } = this.props;
    const { startLocX, startLocY, dragArea } = this.state;

    return {
      bottom: dragArea.bottom + (enableY ? yLoc - startLocY : 0),
      left: dragArea.left + (enableX ? xLoc - startLocX : 0),
      right: dragArea.right + (enableX ? xLoc - startLocX : 0),
      top: dragArea.top + (enableY ? yLoc - startLocY : 0),
    };
  }

  _clickedOutsideDrag(xLoc, yLoc) {
    const { enableX, enableY, marginLeft, marginTop } = this.props;
    const {
      dragArea,
      brushArea: { left, right, top, bottom },
    } = this.state;
    const actualXLoc = xLoc + marginLeft;
    const actualYLoc = yLoc + marginTop;
    const clickedOutsideDragX = dragArea && (actualXLoc < left || actualXLoc > right);
    const clickedOutsideDragY = dragArea && (actualYLoc < top || actualYLoc > bottom);
    if (enableX && enableY) {
      return clickedOutsideDragX || clickedOutsideDragY;
    }
    if (enableX) {
      return clickedOutsideDragX;
    }
    if (enableY) {
      return clickedOutsideDragY;
    }
    return true;
  }

  _convertAreaToCoordinates(brushArea) {
    // NOTE only continuous scales are supported for brushing/getting coordinates back
    const { enableX, enableY, marginLeft, marginTop } = this.props;
    const xScale = ScaleUtils.getAttributeScale(this.props, 'x');
    const yScale = ScaleUtils.getAttributeScale(this.props, 'y');

    // Ensure that users wishes are being respected about which scales are evaluated
    // this is specifically enabled to ensure brushing on mixed categorical and linear
    // charts will run as expected

    if (enableX && enableY) {
      return {
        bottom: yScale.invert(brushArea.bottom),
        left: xScale.invert(brushArea.left - marginLeft),
        right: xScale.invert(brushArea.right - marginLeft),
        top: yScale.invert(brushArea.top),
      };
    }

    if (enableY) {
      return {
        bottom: yScale.invert(brushArea.bottom - marginTop),
        top: yScale.invert(brushArea.top - marginTop),
      };
    }

    if (enableX) {
      return {
        left: xScale.invert(brushArea.left - marginLeft),
        right: xScale.invert(brushArea.right - marginLeft),
      };
    }

    return {};
  }

  /*
    This is a public method which can be accessed via ref which will allow
    consumer to control Highlight Window.
  */
  setHighlightedArea = highlightArea => {
    const {
      highlightHeight,
      highlightWidth,
      innerWidth,
      innerHeight,
      marginLeft,
      marginBottom,
      marginTop,
      marginRight,
    } = this.props;

    const xScale = ScaleUtils.getAttributeScale(this.props, 'x');
    const yScale = ScaleUtils.getAttributeScale(this.props, 'y');

    const plotHeight = innerHeight + marginTop + marginBottom;
    const plotWidth = innerWidth + marginLeft + marginRight;

    let bottomPos = highlightHeight || plotHeight;
    if (highlightArea.bottom) {
      bottomPos = yScale(highlightArea.bottom) + marginTop;
    }
    let topPos = 0;
    if (highlightArea.top) {
      topPos = yScale(highlightArea.top) + marginTop;
    }
    let leftPos = 0 + marginLeft;
    if (highlightArea.left) {
      leftPos = xScale(highlightArea.left) + marginLeft;
    }
    let rightPos = highlightWidth || plotWidth;
    if (highlightArea.right) {
      rightPos = xScale(highlightArea.right) + marginLeft;
    }

    const brushArea = {
      bottom: bottomPos,
      right: rightPos,
      left: leftPos,
      top: topPos,
    };
    this.setState({ brushArea, dragArea: brushArea });
  };

  startBrushing(e) {
    e.preventDefault();
    const { onDragStart, drag } = this.props;
    const { dragArea } = this.state;
    const { xLoc, yLoc } = getLocs(e);
    const clickedOutsideDrag = this._clickedOutsideDrag(xLoc, yLoc);
    if (!clickedOutsideDrag && drag) {
      this.setState({
        dragging: true,
        brushArea: dragArea,
        brushing: false,
        startLocX: xLoc,
        startLocY: yLoc,
      });
      if (onDragStart) {
        onDragStart(e);
      }
    }
  }

  stopBrushing(e) {
    const { brushing, dragging, brushArea } = this.state;
    // Quickly short-circuit if the user isn't brushing in our component
    if (!brushing && !dragging) {
      return;
    }
    const { onBrushEnd, onDragEnd, drag } = this.props;
    const noHorizontal = Math.abs(brushArea.right - brushArea.left) < 5;
    const noVertical = Math.abs(brushArea.top - brushArea.bottom) < 5;
    // Invoke the callback with null if the selected area was < 5px
    const isNulled = noVertical || noHorizontal;
    // Clear the draw area
    this.setState({
      brushing: false,
      dragging: false,
      brushArea: drag ? brushArea : { top: 0, right: 0, bottom: 0, left: 0 },
      startLocX: 0,
      startLocY: 0,
      dragArea: drag && !isNulled && brushArea,
    });

    if (brushing && onBrushEnd) {
      onBrushEnd(!isNulled ? this._convertAreaToCoordinates(brushArea) : null);
    }

    if (drag && onDragEnd) {
      onDragEnd(!isNulled ? this._convertAreaToCoordinates(brushArea) : null);
    }
  }

  onBrush(e) {
    const { marginLeft, marginRight, innerWidth, onBrush, onDrag, drag } = this.props;
    const { brushing, dragging } = this.state;
    const { xLoc, yLoc } = getLocs(e);
    if (brushing) {
      const brushArea = this._getDrawArea(xLoc, yLoc);
      this.setState({ brushArea });
      if (onBrush) {
        onBrush(this._convertAreaToCoordinates(brushArea));
      }
    }

    if (drag && dragging) {
      const brushArea = this._getDragArea(xLoc, yLoc);
      const rightBoundary = innerWidth + marginRight;
      const leftBoundary = marginLeft;
      if (brushArea.right <= rightBoundary && brushArea.left >= leftBoundary) {
        this.setState({ brushArea });
        if (onDrag) {
          onDrag(this._convertAreaToCoordinates(brushArea));
        }
      }
    }
  }

  getHighlighterStyles() {
    const { isDarkMode } = this.props;
    if (isDarkMode) {
      return {
        fill: 'black',
        opacity: 0.1,
      };
    }
    return {
      fill: 'white',
      opacity: 0.8,
    };
  }
  render() {
    const {
      color,
      className,
      highlightHeight,
      highlightWidth,
      highlightX,
      highlightY,
      innerWidth,
      innerHeight,
      marginLeft,
      marginRight,
      marginTop,
      marginBottom,
      opacity,
    } = this.props;
    const {
      brushArea: { left, right, top, bottom },
    } = this.state;

    let leftPos = 0;

    if (highlightX) {
      const xScale = ScaleUtils.getAttributeScale(this.props, 'x');
      leftPos = xScale(highlightX);
    }

    let topPos = 0;
    if (highlightY) {
      const yScale = ScaleUtils.getAttributeScale(this.props, 'y');
      topPos = yScale(highlightY);
    }

    const plotWidth = marginLeft + marginRight + innerWidth;
    const plotHeight = marginTop + marginBottom + innerHeight;
    const touchWidth = highlightWidth || plotWidth;
    const touchHeight = highlightHeight || plotHeight;

    return (
      <g
        transform={`translate(${leftPos}, ${topPos})`}
        className={`${className} rv-highlight-container`}
      >
        {/* An overlay on a graph which allows dragging */}
        <rect
          className="rv-mouse-target"
          opacity="0"
          cursor="move"
          x={marginLeft}
          y={0}
          width={Math.max(touchWidth, 0)}
          height={Math.max(touchHeight, 0)}
          onMouseDown={e => this.startBrushing(e)}
          onMouseMove={e => this.onBrush(e)}
          onMouseUp={e => this.stopBrushing(e)}
          onMouseLeave={e => this.stopBrushing(e)}
          // preventDefault() so that mouse event emulation does not happen
          onTouchEnd={e => {
            e.preventDefault();
            this.stopBrushing(e);
          }}
          onTouchCancel={e => {
            e.preventDefault();
            this.stopBrushing(e);
          }}
          onContextMenu={e => e.preventDefault()}
          onContextMenuCapture={e => e.preventDefault()}
        />

        {/* Left side of overlay which allows us to give an opacity to cover */}
        <rect
          pointerEvents="none"
          className="rv-mouse-target"
          x={marginLeft}
          y="0"
          width={Math.max(left - marginLeft, 0)}
          height={Math.max(touchHeight, 0)}
          onMouseLeave={e => e.preventDefault()}
          {...this.getHighlighterStyles()}
        />
        {/* A Center Highlighter */}
        <rect
          pointerEvents="none"
          opacity={opacity}
          fill={color}
          x={left}
          y={top}
          width={Math.max(0, right - left)}
          height={Math.max(0, bottom - top)}
          onMouseLeave={e => e.preventDefault()}
        />
        {/* Right side of overlay which allows us to give an opacity to cover */}
        <rect
          pointerEvents="none"
          className="rv-mouse-target"
          x={right}
          y="0"
          width={Math.max(touchWidth - right, 0)}
          height={Math.max(touchHeight, 0)}
          onMouseLeave={e => e.preventDefault()}
          {...this.getHighlighterStyles()}
        />

        {/* Draws border lines on Highlighted area */}
        <g>
          <rect
            pointerEvents="none"
            x={left}
            y={top}
            width="1"
            height={Math.max(0, bottom - top)}
            fill="rgb(151,151,151)"
            stroke="none"
            onMouseLeave={e => e.preventDefault()}
          />
          <rect
            pointerEvents="none"
            x={right}
            y={top}
            width="1"
            height={Math.max(0, bottom - top)}
            fill="rgb(151,151,151)"
            stroke="none"
            onMouseLeave={e => e.preventDefault()}
          />
          <line
            pointerEvents="none"
            x1={left}
            x2={right}
            stroke="rgb(151,151,151)"
            strokeWidth={2}
            onMouseLeave={e => e.preventDefault()}
          />
        </g>
      </g>
    );
  }
}

Highlight.displayName = 'HighlightOverlay';

Highlight.defaultProps = {
  color: 'rgb(77, 182, 172)',
  className: '',
  enableX: true,
  enableY: true,
  highlightRef: null,
  opacity: 0.3,
};

Highlight.propTypes = {
  ...AbstractSeries.propTypes,
  enableX: PropTypes.bool,
  enableY: PropTypes.bool,
  highlightHeight: PropTypes.number,
  highlightWidth: PropTypes.number,
  highlightX: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  highlightY: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  highlightRef: PropTypes.func,
  onBrushStart: PropTypes.func,
  onDragStart: PropTypes.func,
  onBrush: PropTypes.func,
  onDrag: PropTypes.func,
  onBrushEnd: PropTypes.func,
  onDragEnd: PropTypes.func,
};

export default Highlight;
