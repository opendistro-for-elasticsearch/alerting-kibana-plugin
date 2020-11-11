/******/ (function (modules) {
  // webpackBootstrap
  /******/ // install a JSONP callback for chunk loading
  /******/ function webpackJsonpCallback(data) {
    /******/ var chunkIds = data[0];
    /******/ var moreModules = data[1]; // add "moreModules" to the modules object, // then flag all "chunkIds" as loaded and fire callback
    /******/
    /******/
    /******/ /******/ /******/ var moduleId,
      chunkId,
      i = 0,
      resolves = [];
    /******/ for (; i < chunkIds.length; i++) {
      /******/ chunkId = chunkIds[i];
      /******/ if (
        Object.prototype.hasOwnProperty.call(installedChunks, chunkId) &&
        installedChunks[chunkId]
      ) {
        /******/ resolves.push(installedChunks[chunkId][0]);
        /******/
      }
      /******/ installedChunks[chunkId] = 0;
      /******/
    }
    /******/ for (moduleId in moreModules) {
      /******/ if (Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
        /******/ modules[moduleId] = moreModules[moduleId];
        /******/
      }
      /******/
    }
    /******/ if (parentJsonpFunction) parentJsonpFunction(data);
    /******/
    /******/ while (resolves.length) {
      /******/ resolves.shift()();
      /******/
    }
    /******/
    /******/
  } // The module cache
  /******/
  /******/
  /******/ /******/ var installedModules = {}; // object to store loaded and loading chunks // undefined = chunk not loaded, null = chunk preloaded/prefetched // Promise = chunk loading, 0 = chunk loaded
  /******/
  /******/ /******/ /******/ /******/ var installedChunks = {
    /******/ opendistroAlerting: 0,
    /******/
  }; // script path function
  /******/
  /******/
  /******/
  /******/ /******/ function jsonpScriptSrc(chunkId) {
    /******/ return __webpack_require__.p + '' + ({}[chunkId] || chunkId) + '.plugin.js';
    /******/
  } // The require function
  /******/
  /******/ /******/ function __webpack_require__(moduleId) {
    /******/
    /******/ // Check if module is in cache
    /******/ if (installedModules[moduleId]) {
      /******/ return installedModules[moduleId].exports;
      /******/
    } // Create a new module (and put it into the cache)
    /******/ /******/ var module = (installedModules[moduleId] = {
      /******/ i: moduleId,
      /******/ l: false,
      /******/ exports: {},
      /******/
    }); // Execute the module function
    /******/
    /******/ /******/ modules[moduleId].call(
      module.exports,
      module,
      module.exports,
      __webpack_require__
    ); // Flag the module as loaded
    /******/
    /******/ /******/ module.l = true; // Return the exports of the module
    /******/
    /******/ /******/ return module.exports;
    /******/
  } // This file contains only the entry chunk. // The chunk loading function for additional chunks
  /******/
  /******/ /******/ /******/ __webpack_require__.e = function requireEnsure(chunkId) {
    /******/ var promises = []; // JSONP chunk loading for javascript
    /******/
    /******/
    /******/ /******/
    /******/ var installedChunkData = installedChunks[chunkId];
    /******/ if (installedChunkData !== 0) {
      // 0 means "already installed".
      /******/
      /******/ // a Promise means "currently loading".
      /******/ if (installedChunkData) {
        /******/ promises.push(installedChunkData[2]);
        /******/
      } else {
        /******/ // setup Promise in chunk cache
        /******/ var promise = new Promise(function (resolve, reject) {
          /******/ installedChunkData = installedChunks[chunkId] = [resolve, reject];
          /******/
        });
        /******/ promises.push((installedChunkData[2] = promise)); // start chunk loading
        /******/
        /******/ /******/ var script = document.createElement('script');
        /******/ var onScriptComplete;
        /******/
        /******/ script.charset = 'utf-8';
        /******/ script.timeout = 120;
        /******/ if (__webpack_require__.nc) {
          /******/ script.setAttribute('nonce', __webpack_require__.nc);
          /******/
        }
        /******/ script.src = jsonpScriptSrc(chunkId); // create error before stack unwound to get useful stacktrace later
        /******/
        /******/ /******/ var error = new Error();
        /******/ onScriptComplete = function (event) {
          /******/ // avoid mem leaks in IE.
          /******/ script.onerror = script.onload = null;
          /******/ clearTimeout(timeout);
          /******/ var chunk = installedChunks[chunkId];
          /******/ if (chunk !== 0) {
            /******/ if (chunk) {
              /******/ var errorType = event && (event.type === 'load' ? 'missing' : event.type);
              /******/ var realSrc = event && event.target && event.target.src;
              /******/ error.message =
                'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
              /******/ error.name = 'ChunkLoadError';
              /******/ error.type = errorType;
              /******/ error.request = realSrc;
              /******/ chunk[1](error);
              /******/
            }
            /******/ installedChunks[chunkId] = undefined;
            /******/
          }
          /******/
        };
        /******/ var timeout = setTimeout(function () {
          /******/ onScriptComplete({ type: 'timeout', target: script });
          /******/
        }, 120000);
        /******/ script.onerror = script.onload = onScriptComplete;
        /******/ document.head.appendChild(script);
        /******/
      }
      /******/
    }
    /******/ return Promise.all(promises);
    /******/
  }; // expose the modules object (__webpack_modules__)
  /******/
  /******/ /******/ __webpack_require__.m = modules; // expose the module cache
  /******/
  /******/ /******/ __webpack_require__.c = installedModules; // define getter function for harmony exports
  /******/
  /******/ /******/ __webpack_require__.d = function (exports, name, getter) {
    /******/ if (!__webpack_require__.o(exports, name)) {
      /******/ Object.defineProperty(exports, name, { enumerable: true, get: getter });
      /******/
    }
    /******/
  }; // define __esModule on exports
  /******/
  /******/ /******/ __webpack_require__.r = function (exports) {
    /******/ if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
      /******/ Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
      /******/
    }
    /******/ Object.defineProperty(exports, '__esModule', { value: true });
    /******/
  }; // create a fake namespace object // mode & 1: value is a module id, require it // mode & 2: merge all properties of value into the ns // mode & 4: return value when already ns object // mode & 8|1: behave like require
  /******/
  /******/ /******/ /******/ /******/ /******/ /******/ __webpack_require__.t = function (
    value,
    mode
  ) {
    /******/ if (mode & 1) value = __webpack_require__(value);
    /******/ if (mode & 8) return value;
    /******/ if (mode & 4 && typeof value === 'object' && value && value.__esModule) return value;
    /******/ var ns = Object.create(null);
    /******/ __webpack_require__.r(ns);
    /******/ Object.defineProperty(ns, 'default', { enumerable: true, value: value });
    /******/ if (mode & 2 && typeof value != 'string')
      for (var key in value)
        __webpack_require__.d(
          ns,
          key,
          function (key) {
            return value[key];
          }.bind(null, key)
        );
    /******/ return ns;
    /******/
  }; // getDefaultExport function for compatibility with non-harmony modules
  /******/
  /******/ /******/ __webpack_require__.n = function (module) {
    /******/ var getter =
      module && module.__esModule
        ? /******/ function getDefault() {
            return module['default'];
          }
        : /******/ function getModuleExports() {
            return module;
          };
    /******/ __webpack_require__.d(getter, 'a', getter);
    /******/ return getter;
    /******/
  }; // Object.prototype.hasOwnProperty.call
  /******/
  /******/ /******/ __webpack_require__.o = function (object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
  }; // __webpack_public_path__
  /******/
  /******/ /******/ __webpack_require__.p = ''; // on error function for async loading
  /******/
  /******/ /******/ __webpack_require__.oe = function (err) {
    console.error(err);
    throw err;
  };
  /******/
  /******/ var jsonpArray = (window['opendistroAlerting_bundle_jsonpfunction'] =
    window['opendistroAlerting_bundle_jsonpfunction'] || []);
  /******/ var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
  /******/ jsonpArray.push = webpackJsonpCallback;
  /******/ jsonpArray = jsonpArray.slice();
  /******/ for (var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);
  /******/ var parentJsonpFunction = oldJsonpFunction; // Load entry module and return exports
  /******/
  /******/
  /******/ /******/ return __webpack_require__(
    (__webpack_require__.s = '../../packages/kbn-optimizer/target/worker/entry_point_creator.js')
  );
  /******/
})(
  /************************************************************************/
  /******/ {
    /***/ '../../node_modules/val-loader/dist/cjs.js?key=opendistroAlerting!../../packages/kbn-ui-shared-deps/public_path_module_creator.js':
      /*!**************************************************************************************************************************************************************************************************!*\
  !*** /Users/ftianli/Github/kibana_7.9.1/node_modules/val-loader/dist/cjs.js?key=opendistroAlerting!/Users/ftianli/Github/kibana_7.9.1/packages/kbn-ui-shared-deps/public_path_module_creator.js ***!
  \**************************************************************************************************************************************************************************************************/
      /*! no static exports found */
      /***/ function (module, exports, __webpack_require__) {
        __webpack_require__.p = window.__kbnPublicPath__['opendistroAlerting'];

        /***/
      },

    /***/ '../../packages/kbn-optimizer/target/worker/entry_point_creator.js':
      /*!******************************************************************************************************!*\
  !*** /Users/ftianli/Github/kibana_7.9.1/packages/kbn-optimizer/target/worker/entry_point_creator.js ***!
  \******************************************************************************************************/
      /*! no exports provided */
      /***/ function (module, __webpack_exports__, __webpack_require__) {
        'use strict';
        __webpack_require__.r(__webpack_exports__);
        /* harmony import */ var _node_modules_val_loader_dist_cjs_js_key_opendistroAlerting_kbn_ui_shared_deps_public_path_module_creator_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
          /*! ../../../../node_modules/val-loader/dist/cjs.js?key=opendistroAlerting!../../../kbn-ui-shared-deps/public_path_module_creator.js */ '../../node_modules/val-loader/dist/cjs.js?key=opendistroAlerting!../../packages/kbn-ui-shared-deps/public_path_module_creator.js'
        );
        /* harmony import */ var _node_modules_val_loader_dist_cjs_js_key_opendistroAlerting_kbn_ui_shared_deps_public_path_module_creator_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/ __webpack_require__.n(
          _node_modules_val_loader_dist_cjs_js_key_opendistroAlerting_kbn_ui_shared_deps_public_path_module_creator_js__WEBPACK_IMPORTED_MODULE_0__
        );
        __kbnBundles__.define(
          'plugin/opendistroAlerting/public',
          __webpack_require__,
          /*require.resolve*/ /*! ../../../../plugins/alerting-kibana-plugin/public */ './public/index.js'
        );

        /***/
      },

    /***/ './public/index.js':
      /*!*************************!*\
  !*** ./public/index.js ***!
  \*************************/
      /*! exports provided: plugin */
      /***/ function (module, __webpack_exports__, __webpack_require__) {
        'use strict';
        __webpack_require__.r(__webpack_exports__);
        /* harmony export (binding) */ __webpack_require__.d(
          __webpack_exports__,
          'plugin',
          function () {
            return plugin;
          }
        );
        /* harmony import */ var _plugin__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
          /*! ./plugin */ './public/plugin.js'
        );

        function plugin(initializerContext) {
          return new _plugin__WEBPACK_IMPORTED_MODULE_0__['AlertingPlugin'](initializerContext);
        }

        /***/
      },

    /***/ './public/plugin.js':
      /*!**************************!*\
  !*** ./public/plugin.js ***!
  \**************************/
      /*! exports provided: AlertingPlugin */
      /***/ function (module, __webpack_exports__, __webpack_require__) {
        'use strict';
        __webpack_require__.r(__webpack_exports__);
        /* harmony export (binding) */ __webpack_require__.d(
          __webpack_exports__,
          'AlertingPlugin',
          function () {
            return AlertingPlugin;
          }
        );
        /* harmony import */ var _utils_constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
          /*! ./utils/constants */ './public/utils/constants.js'
        );
        // import { DEFAULT_APP_CATEGORIES } from '../../src/core';

        class AlertingPlugin {
          constructor(initializerContext) {
            // can retrieve config from initializerContext
          }

          setup(core) {
            core.application.register({
              id: 'alerting',
              title: 'Alerting',
              description: 'Kibana Alerting Plugin',
              // main: `plugins/${PLUGIN_NAME}/app`,
              // icon: `plugins/${PLUGIN_NAME}/images/alerting_icon.svg`,
              order: 8020,
              mount: async (params) => {
                const { renderApp } = await Promise.all(
                  /*! import() */ [__webpack_require__.e(1), __webpack_require__.e(0)]
                ).then(__webpack_require__.bind(null, /*! ./app */ './public/app.js'));
                const [coreStart, depsStart] = await core.getStartServices();
                return renderApp(coreStart, params);
              }, // category: DEFAULT_APP_CATEGORIES.kibana,
            });
            return {};
          }

          start(core) {
            return {};
          }
        }

        /***/
      },

    /***/ './public/utils/constants.js':
      /*!***********************************!*\
  !*** ./public/utils/constants.js ***!
  \***********************************/
      /*! exports provided: ALERT_STATE, DEFAULT_EMPTY_DATA, APP_PATH, SEARCH_TYPE, DESTINATION_ACTIONS, MONITOR_ACTIONS, TRIGGER_ACTIONS, DATA_TYPES, ES_AD_PLUGIN, KIBANA_AD_PLUGIN, INPUTS_DETECTOR_ID, MONITOR_INPUT_DETECTOR_ID, AD_PREVIEW_DAYS */
      /***/ function (module, __webpack_exports__, __webpack_require__) {
        'use strict';
        __webpack_require__.r(__webpack_exports__);
        /* harmony export (binding) */ __webpack_require__.d(
          __webpack_exports__,
          'ALERT_STATE',
          function () {
            return ALERT_STATE;
          }
        );
        /* harmony export (binding) */ __webpack_require__.d(
          __webpack_exports__,
          'DEFAULT_EMPTY_DATA',
          function () {
            return DEFAULT_EMPTY_DATA;
          }
        );
        /* harmony export (binding) */ __webpack_require__.d(
          __webpack_exports__,
          'APP_PATH',
          function () {
            return APP_PATH;
          }
        );
        /* harmony export (binding) */ __webpack_require__.d(
          __webpack_exports__,
          'SEARCH_TYPE',
          function () {
            return SEARCH_TYPE;
          }
        );
        /* harmony export (binding) */ __webpack_require__.d(
          __webpack_exports__,
          'DESTINATION_ACTIONS',
          function () {
            return DESTINATION_ACTIONS;
          }
        );
        /* harmony export (binding) */ __webpack_require__.d(
          __webpack_exports__,
          'MONITOR_ACTIONS',
          function () {
            return MONITOR_ACTIONS;
          }
        );
        /* harmony export (binding) */ __webpack_require__.d(
          __webpack_exports__,
          'TRIGGER_ACTIONS',
          function () {
            return TRIGGER_ACTIONS;
          }
        );
        /* harmony export (binding) */ __webpack_require__.d(
          __webpack_exports__,
          'DATA_TYPES',
          function () {
            return DATA_TYPES;
          }
        );
        /* harmony export (binding) */ __webpack_require__.d(
          __webpack_exports__,
          'ES_AD_PLUGIN',
          function () {
            return ES_AD_PLUGIN;
          }
        );
        /* harmony export (binding) */ __webpack_require__.d(
          __webpack_exports__,
          'KIBANA_AD_PLUGIN',
          function () {
            return KIBANA_AD_PLUGIN;
          }
        );
        /* harmony export (binding) */ __webpack_require__.d(
          __webpack_exports__,
          'INPUTS_DETECTOR_ID',
          function () {
            return INPUTS_DETECTOR_ID;
          }
        );
        /* harmony export (binding) */ __webpack_require__.d(
          __webpack_exports__,
          'MONITOR_INPUT_DETECTOR_ID',
          function () {
            return MONITOR_INPUT_DETECTOR_ID;
          }
        );
        /* harmony export (binding) */ __webpack_require__.d(
          __webpack_exports__,
          'AD_PREVIEW_DAYS',
          function () {
            return AD_PREVIEW_DAYS;
          }
        );
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
        const ALERT_STATE = Object.freeze({
          ACTIVE: 'ACTIVE',
          ACKNOWLEDGED: 'ACKNOWLEDGED',
          COMPLETED: 'COMPLETED',
          ERROR: 'ERROR',
          DELETED: 'DELETED',
        });
        const DEFAULT_EMPTY_DATA = '-';
        const APP_PATH = {
          CREATE_MONITOR: '/create-monitor',
          CREATE_DESTINATION: '/create-destination',
        };
        const SEARCH_TYPE = {
          GRAPH: 'graph',
          QUERY: 'query',
          AD: 'ad',
        };
        const DESTINATION_ACTIONS = {
          UPDATE_DESTINATION: 'update-destination',
        };
        const MONITOR_ACTIONS = {
          UPDATE_MONITOR: 'update-monitor',
        };
        const TRIGGER_ACTIONS = {
          UPDATE_TRIGGER: 'update-trigger',
          CREATE_TRIGGER: 'create-trigger',
        };
        const DATA_TYPES = {
          NUMBER: 'number',
          TEXT: 'text',
          BOOLEAN: 'boolean',
          KEYWORD: 'keyword',
        };
        const ES_AD_PLUGIN = 'opendistro-anomaly-detection';
        const KIBANA_AD_PLUGIN = 'opendistro-anomaly-detection-kibana';
        const INPUTS_DETECTOR_ID = '0.search.query.query.bool.filter[1].term.detector_id.value';
        const MONITOR_INPUT_DETECTOR_ID = `inputs.${INPUTS_DETECTOR_ID}`;
        const AD_PREVIEW_DAYS = 7;

        /***/
      },

    /***/ '@elastic/charts':
      /*!**************************************************!*\
  !*** external "__kbnSharedDeps__.ElasticCharts" ***!
  \**************************************************/
      /*! no static exports found */
      /***/ function (module, exports) {
        module.exports = __kbnSharedDeps__.ElasticCharts;

        /***/
      },

    /***/ '@elastic/eui':
      /*!***********************************************!*\
  !*** external "__kbnSharedDeps__.ElasticEui" ***!
  \***********************************************/
      /*! no static exports found */
      /***/ function (module, exports) {
        module.exports = __kbnSharedDeps__.ElasticEui;

        /***/
      },

    /***/ moment:
      /*!*******************************************!*\
  !*** external "__kbnSharedDeps__.Moment" ***!
  \*******************************************/
      /*! no static exports found */
      /***/ function (module, exports) {
        module.exports = __kbnSharedDeps__.Moment;

        /***/
      },

    /***/ 'moment-timezone':
      /*!***************************************************!*\
  !*** external "__kbnSharedDeps__.MomentTimezone" ***!
  \***************************************************/
      /*! no static exports found */
      /***/ function (module, exports) {
        module.exports = __kbnSharedDeps__.MomentTimezone;

        /***/
      },

    /***/ react:
      /*!******************************************!*\
  !*** external "__kbnSharedDeps__.React" ***!
  \******************************************/
      /*! no static exports found */
      /***/ function (module, exports) {
        module.exports = __kbnSharedDeps__.React;

        /***/
      },

    /***/ 'react-dom':
      /*!*********************************************!*\
  !*** external "__kbnSharedDeps__.ReactDom" ***!
  \*********************************************/
      /*! no static exports found */
      /***/ function (module, exports) {
        module.exports = __kbnSharedDeps__.ReactDom;

        /***/
      },

    /***/ 'react-router-dom':
      /*!***************************************************!*\
  !*** external "__kbnSharedDeps__.ReactRouterDom" ***!
  \***************************************************/
      /*! no static exports found */
      /***/ function (module, exports) {
        module.exports = __kbnSharedDeps__.ReactRouterDom;

        /***/
      },

    /******/
  }
);
//# sourceMappingURL=opendistroAlerting.plugin.js.map
