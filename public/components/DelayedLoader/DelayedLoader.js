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

class DelayedLoader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayLoader: false,
    };
    if (typeof props.children !== 'function') {
      throw new Error('Children should be function');
    }
  }
  componentDidMount() {
    if (this.props.isLoading) {
      this.setTimer();
    }
  }
  componentDidUpdate(prevProps) {
    const { isLoading } = this.props;
    // Setting up the loader to be visible only when network is too slow
    if (isLoading !== prevProps.isLoading) {
      if (isLoading) {
        this.setTimer();
      } else {
        this.clearTimer();
        this.setState({ displayLoader: false });
      }
    }
  }

  componentWillUnmount() {
    this.clearTimer();
  }

  clearTimer = () => {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  };

  setTimer = () => {
    this.timer = setTimeout(this.handleDisplayLoader, 1000);
  };

  handleDisplayLoader = () => this.setState({ displayLoader: true });

  render() {
    const { displayLoader } = this.state;
    return this.props.children(displayLoader);
  }
}

DelayedLoader.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  children: PropTypes.func.isRequired,
};

export default DelayedLoader;
