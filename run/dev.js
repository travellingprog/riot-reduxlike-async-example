#!/usr/bin/env node

const fse = require('fs-extra');
const path = require('path');
const useref = require('useref');
const util = require('./util');

dev();

/** dev runs the compiler for the development build */
function dev() {
  console.time('dev task');

  const rootDir = path.resolve(__dirname, '..');
  const libsDir = rootDir + '/libs';

  const srcDir = rootDir + '/src';
  const inputPage = srcDir + '/pages/index.html';

  const buildDir = rootDir + '/build';
  const outputPage = buildDir + '/index.html';
  const outputJsDir = buildDir + '/assets/js';
  const outputLibsDir = buildDir + '/assets/js/libs';

  fse.removeSync(buildDir);

  compileHtml(inputPage, outputPage)
    .then(() => copyLibraries(libsDir, outputLibsDir))
    .then(() => {
      console.timeEnd('dev task');
      console.log('done.');
    })
    .catch(err => {
      console.error('Something went wrong!', err.toString(), '\n', err.stack);
    })
}

/** compileHtml takes our input HTML file and passes it through useref before outputting it */
function compileHtml(inputPage, outputPage) {
  console.time('compile HTML');

  return util.readFile(inputPage)
    .then(inputHtml => {
      const result = useref(inputHtml, { noconcat: true }); // removes build: comments
      const outputHtml = result[0];
      return util.writeFile(outputPage, outputHtml);
    })
    .then(res => {
      console.timeEnd('compile HTML');
      return res;
    });
}

/** copyLibraries copies the external libraries into our JS directory */
function copyLibraries(libsDir, outputJsDir) {
  console.time('copy libraries');
  fse.copySync(libsDir, outputJsDir);
  console.timeEnd('copy libraries');
  return Promise.resolve();
}
