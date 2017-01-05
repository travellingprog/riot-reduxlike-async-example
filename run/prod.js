#!/usr/bin/env node

console.time('load task dependencies');

console.log('loading babel...');  // ...which takes a while
// require('time-require'); // <- useful for logging require() times
const babel = require('babel-core');

console.log('loading other dependencies...')
const crypto = require('crypto');
const fse = require('fs-extra');
const path = require('path');
const riot = require('riot');
const UglifyJS = require('uglify-js');
const useref = require('useref');
const util = require('./util');

console.timeEnd('load task dependencies');

prod();

/** prod runs the compiler for the production build, starts a static server and launches the app */
function prod() {
  console.time('prod task');

  const rootDir = path.resolve(__dirname, '..');
  const buildDir = rootDir + '/build';
  const libsDir = rootDir + '/libs';
  const srcDir = rootDir + '/src';

  const inputPage = srcDir + '/pages/index.html';
  const inputTagDirs = [srcDir + '/components', srcDir + '/containers'];
  const inputAppPaths = [
    srcDir + '/env/prod.js',
    srcDir + '/flux',
    srcDir + '/mixins',
    srcDir + '/index.js',
  ];

  const outputPage = buildDir + '/index.html';
  const outputJsDir = buildDir + '/assets/js';

  const serverPort = 9000;
  const filenames = {}; // for storing filenames with hashes in them

  fse.removeSync(buildDir);

  concatLibraries(libsDir, outputJsDir)
    .then(libsFile => {
      filenames.LIBS_FILE = libsFile;
      return compileAppFile(inputTagDirs, inputAppPaths, outputJsDir);
    })
    .then(appFile => {
      filenames.APP_FILE = appFile;
      return compileHtml(inputPage, filenames, outputPage);
    })
    .then(() => util.startServer(buildDir, serverPort, true))
    .then(() => {
      console.timeEnd('prod task');
    })
    .catch(err => {
      console.error('Something went wrong!', err.toString(), '\n', err.stack);
    })
}

/**
 * concatLibraries simply concatanates all library files into one file, and returns a filename with
 * the hash of the file contents
 */
function concatLibraries(libsDir, outputJsDir) {
  console.time('concatenating libraries');

  let filename = null;
  const fileReads = util.getAllFiles(libsDir).map(util.readFile);

  return Promise.all(fileReads)
    .then(jsArr => {
      const js = jsArr.join('\n');
      filename = `libs.${ hash(js) }.js`;
      return util.writeFile(`${outputJsDir}/${filename}`, js);
    })
    .then(() => {
      console.timeEnd('concatenating libraries');
      return filename;
    });
}

/**
 * compileAppFile triggers the compilation of the Riot tags, and the rest of the application code.
 * All of this code is placed inside a single minified file, and a filename with a hash of the file
 * content is returned.
 */
function compileAppFile(inputTagDirs, inputAppPaths, outputJsDir) {
  console.time('compile app.min.js');

  let filename = null;

  const riotCompilations = util
    .getAllFiles(inputTagDirs, '.tag')
    .map(f =>
      util.readFile(f).then(tag => riot.compile(tag))
    );

  const appFileReads = util.getAllFiles(inputAppPaths).map(util.readFile);

  const allJsLoad = riotCompilations.concat(appFileReads);

  return Promise.all(allJsLoad)
    .then(jsArr => {
      const js = jsArr.join('\n');

      const transformResult = babel.transform(js, {
        presets: ['es2015-riot'],
        plugins: ['transform-object-rest-spread'],
      });

      const miniCode = UglifyJS.minify(transformResult.code, { fromString: true }).code;
      filename = `app.${ hash(miniCode) }.min.js`;
      return util.writeFile(`${outputJsDir}/${filename}`, miniCode);
    })
    .then(() => {
      console.timeEnd('compile app.min.js');
      return filename;
    });
}

/** hash returns an 11-character SHA1 hash of a given string */
function hash(str) {
  return crypto.createHash('SHA1')
    .update(str)
    .digest('hex')
    .substr(0, 11);
}

/**
 * compileHtml takes our input HTML file, injects production filenames into the build blocks and
 * passes it through useref before outputting it
 */
function compileHtml(inputPage, filenames, outputPage) {
  console.time('compile HTML');

  return util.readFile(inputPage)
    .then(inputHtml => {
      const inputWithHashes = inputHtml
        .replace('%LIBS_FILE%', filenames.LIBS_FILE)
        .replace('%APP_FILE%', filenames.APP_FILE);
      const result = useref(inputWithHashes);
      const outputHtml = result[0];
      return util.writeFile(outputPage, outputHtml);
    })
    .then(() => {
      console.timeEnd('compile HTML');
      return true;
    });
}
