#!/usr/bin/env node

console.log('loading task dependencies...');
console.time('load task dependencies');

const babel = require('babel-core');
const crypto = require('crypto');
const finalhandler = require('finalhandler');
const fse = require('fs-extra');
const http = require('http');
const opn = require('opn');
const path = require('path');
const riot = require('riot');
const serveStatic = require('serve-static');
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
  const hashes = {}; // for SHA1 hashes injected into filenames

  fse.removeSync(buildDir);

  concatLibraries(libsDir, outputJsDir)
    .then(libsHash => {
      hashes.LIBS_HASH = libsHash;
      return compileAppFile(inputTagDirs, inputAppPaths, outputJsDir);
    })
    .then(appHash => {
      hashes.APP_HASH = appHash;
      return compileHtml(inputPage, hashes, outputPage);
    })
    .then(() => startServer(buildDir, serverPort))
    .then(() => {
      console.timeEnd('prod task');
    })
    .catch(err => {
      console.error('Something went wrong!', err.toString(), '\n', err.stack);
    })
}

/**
 * concatLibraries simply concatanates all library files into one file, and returns the hash of
 * the file contents
 */
function concatLibraries(libsDir, outputJsDir) {
  console.time('concatenating libraries');

  let hashStr = null;
  const fileReads = fse.walkSync(libsDir)
    .filter(f => !(/\/\..*$/.test(f))) // ignore hidden files and folders
    .map(util.readFile);

  return Promise.all(fileReads)
    .then(jsArr => {
      const js = jsArr.join('\n');
      hashStr = hash(js);
      return util.writeFile(outputJsDir + `/libs.${hashStr}.js`, js);
    })
    .then(() => {
      console.timeEnd('concatenating libraries');
      return hashStr;
    });
}

/**
 * compileAppFile triggers the compilation of the Riot tags, and the rest of the application code.
 * All of this code is placed inside a single minified file, and a hash of the file content is
 * returned.
 */
function compileAppFile(inputTagDirs, inputAppPaths, outputJsDir) {
  console.time('compile app.min.js');

  let hashStr = null;

  const riotFiles = [];
  for (let dir of inputTagDirs) {
    riotFiles.push(...fse.walkSync(dir).filter(f => !(/\/\..*$/.test(f))));
  }

  const riotCompilations = riotFiles.map(f => {
    return util.readFile(f)
      .then(tag => riot.compile(tag))
  });

  const appJsFiles = [];
  for (let inputPath of inputAppPaths) {
    if (inputPath.endsWith('.js')) {
      appJsFiles.push(inputPath);
    } else {
      // assume it's a directory, add all files inside
      appJsFiles.push(...fse.walkSync(inputPath).filter(f => !(/\/\..*$/.test(f))));
    }
  }

  const appFileReads = appJsFiles.map(util.readFile);

  const allJsLoad = riotCompilations.concat(appFileReads);

  return Promise.all(allJsLoad)
    .then(jsArr => {
      const js = jsArr.join('\n');

      const transformResult = babel.transform(js, {
        presets: ['es2015-riot'],
        plugins: ['transform-object-rest-spread'],
      });

      const miniCode = UglifyJS.minify(transformResult.code, { fromString: true }).code;
      hashStr = hash(miniCode);
      return util.writeFile(outputJsDir + `/app.${hashStr}.min.js`, miniCode);
    })
    .then(() => {
      console.time('compile app.min.js');
      return hashStr;
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
 * compileHtml takes our input HTML file, injects filename hashes into the build blocks and passes
 * it through useref before outputting it
 */
function compileHtml(inputPage, hashes, outputPage) {
  console.time('compile HTML');

  return util.readFile(inputPage)
    .then(inputHtml => {
      const inputWithHashes = inputHtml
        .replace('%LIBS_HASH%', hashes.LIBS_HASH)
        .replace('%APP_HASH%', hashes.APP_HASH);
      const result = useref(inputWithHashes);
      const outputHtml = result[0];
      return util.writeFile(outputPage, outputHtml);
    })
    .then(() => {
      console.timeEnd('compile HTML');
      return true;
    });
}

/** startServer begins a static server and opens the root path in the browser */
function startServer(dir, port) {
  console.time('static server');

  return new Promise((resolve, reject) => {
    let isReady = false;
    const serve = serveStatic(dir, { maxAge: 10 * 365 * 24 * 60 * 60 * 1000 });

    http
      .createServer((req, res) => {
        serve(req, res, finalhandler(req, res))
      })
      .on('error', err => {
        console.error(`Server error: ${err}`);
        if (!isReady) reject(err);
      })
      .listen(port, 'localhost', () => {
        opn(`http://localhost:${port}/`);
        console.timeEnd('static server');
        resolve(true);
      });
  });
}
