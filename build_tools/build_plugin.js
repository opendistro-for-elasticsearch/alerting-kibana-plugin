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
require('../../../src/setup_node_env/prebuilt_dev_only_entry');

const execa = require('execa');
const optimizer = require('@kbn/optimizer');
const devUtils = require('@kbn/dev-utils');
// eslint-disable-next-line import/no-unresolved
const pluginHelper = require('@kbn/plugin-helpers');
const pluginConfig = pluginHelper.pluginConfig;
const path = require('path');
const vfs = require('vinyl-fs');
const rename = require('gulp-rename');

// TODO importing from target dir is a hack, need to fix it.
// eslint-disable-next-line import/no-unresolved
const rewritePackageJson = require('@kbn/plugin-helpers/target/tasks/build/rewrite_package_json');
// eslint-disable-next-line import/no-unresolved
const createPackage = require('@kbn/plugin-helpers/target/tasks/build/create_package');

// main build workflow
async function build() {
  const pluginRoot = process.cwd();

  console.log('Building plugin...');
  console.log(`CWD: ${pluginRoot}`);

  // clean up target dir
  console.log('Cleaning up target directory...');
  execa.sync('rm', ['-rf', 'target']);
  execa.sync('rm', ['-rf', 'build']);
  // transpile typescript code
  console.log('Transpiling typescript soruces...');
  const transpileResult = execa.sync('yarn', ['tsc']);
  if (transpileResult.exitCode !== 0) {
    console.log(`Failed to transpile the plugin\n
    stdout:\n${transpileResult.stdout}\n
    stderr:\n${transpileResult.stderr}`);
    process.exit(1);
  }
  console.log(transpileResult.stdout);

  // optimize browser application
  console.log('Exectuing optimizer...');
  try {
    await runOptimizer();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }

  // create plugin package
  console.log('Assembling plugin...');
  const plugin = pluginConfig(pluginRoot);
  const buildTarget = path.resolve(pluginRoot, 'build');
  const buildVersion = plugin.pkg.version;
  await createBuild(pluginRoot, plugin);

  // create plugin zip file
  console.log('Creating plugin zip bundle...');
  try {
    await createPackage.createPackage(plugin, buildTarget, buildVersion);
    // rename to opendistro_security_kibana_plugin-{version}.zip to match legacy plugin name
    execa.sync('mv', [
      `build/${plugin.id}-${buildVersion}.zip`,
      `build/opendistro_security_kibana_plugin-${buildVersion}.zip`,
    ]);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
  console.log(`BUILD SUCCESS`);
}

function runOptimizer() {
  const log = new devUtils.ToolingLog({
    level: 'verbose',
    writeTo: process.stdout,
  });

  const pluignRoot = path.resolve(__dirname, '..');
  log.info(`Start running JS optimization for plugin at ${pluignRoot}`);

  const config = optimizer.OptimizerConfig.create({
    repoRoot: devUtils.REPO_ROOT,
    watch: false,
    oss: true,
    dist: true,
    pluginPaths: [pluignRoot], // specify to build current plugin
    pluginScanDirs: [], // set pluginScanDirs to empty to skip building of other plugins
    cache: false,
  });

  return optimizer.runOptimizer(config).pipe(optimizer.logOptimizerState(log, config)).toPromise();
}

async function createBuild(pluginRoot, plugin) {
  const pluginId = plugin.id;
  const buildVersion = plugin.pkg.version;
  const kibanaVersion = plugin.pkg.kibana.version;
  const buildTarget = path.resolve(pluginRoot, 'build');
  const buildRoot = path.join(buildTarget, 'kibana', pluginId);

  console.log(`${pluginRoot} ${plugin} ${buildTarget}`);

  function nestFileInDir(filePath) {
    const nonRelativeDirname = filePath.dirname.replace(/^(\.\.\/?)+/g, '');
    filePath.dirname = path.join(path.relative(buildTarget, buildRoot), nonRelativeDirname);
  }

  function copyArtifacts(srcGlobs, cwd, base, allowEmpty) {
    return new Promise(function (resolve, reject) {
      vfs
        .src(srcGlobs, { cwd, base, allowEmpty })
        .pipe(rewritePackageJson.rewritePackageJson(pluginRoot, buildVersion, kibanaVersion))
        .pipe(rename(nestFileInDir))
        .pipe(vfs.dest(buildTarget))
        .on('end', resolve)
        .on('error', reject);
    });
  }

  await copyArtifacts(
    ['kibana.json', 'package.json', 'LICENSE', 'NOTICE'],
    pluginRoot,
    pluginRoot,
    true
  );
  await copyArtifacts(['target/public/**/*'], pluginRoot, pluginRoot, true);
  const artifactDir = path.join(pluginRoot, 'target', 'plugins', pluginId);
  await copyArtifacts(['**/*'], artifactDir, artifactDir, true);
  console.log('Copied artifacts to build dir.');

  // install dependencies
  console.log('Installing dependencies');
  const installResult = execa.sync('yarn', ['install', '--production', '--pure-lockfile'], {
    cwd: buildRoot,
  });
  if (installResult.exitCode !== 0) {
    console.log(installResult.error);
    process.exit(1);
  }
  console.log(installResult.stdout);
}

// entry point
(async function () {
  try {
    await build();
  } catch (error) {
    console.log(error);
  }
})();
