#!/usr/bin/env node

console.time('load task dependencies');

console.log('loading babel...');  // ...which takes a while
// require('time-require'); // <- useful for logging require() times
const babel = require('babel-core');

console.log('loading other dependencies...');
const chokidar = require('chokidar');
const Concat = require('concat-with-sourcemaps');
const fse = require('fs-extra');
const path = require('path');
const riot = require('riot');
const useref = require('useref');
const util = require('./util');

console.timeEnd('load task dependencies');

dev();

/**
 * dev runs the compiler for the development build, starts a static server, launches the app and
 * starts a watcher as well.
 */
function dev() {
  console.time('dev task');

  const rootDir = path.resolve(__dirname, '..');
  const buildDir = rootDir + '/build';
  const libsDir = rootDir + '/libs';
  const srcDir = rootDir + '/src';

  const inputPage = srcDir + '/pages/index.html';
  const inputTagDirs = [srcDir + '/components', srcDir + '/containers'];
  const inputAppPaths = [
    srcDir + '/env/dev.js',
    srcDir + '/flux',
    srcDir + '/mixins',
    srcDir + '/index.js',
  ];

  const outputPage = buildDir + '/index.html';
  const outputLibsDir = buildDir + '/assets/js/libs';
  const outputTagsFile = buildDir + '/assets/js/tags.js';
  const outputAppJsFile = buildDir + '/assets/js/app.js';

  const serverPort = 8888;

  fse.removeSync(buildDir);

  compileHtml(inputPage, outputPage)
    .then(() => copyLibraries(libsDir, outputLibsDir))
    .then(() => compileRiotTags(srcDir, inputTagDirs, outputTagsFile))
    .then(() => compileAppJs(inputAppPaths, outputAppJsFile))
    .then(() => util.startServer(buildDir, serverPort))
    .then(() => watch([libsDir, srcDir], rootDir, function (filePath) {
      switch (true) {
        case filePath === inputPage:
          compileHtml(inputPage, outputPage);
          break;

        case filePath.startsWith(libsDir):
          copyLibraries(libsDir, outputLibsDir);
          break;

        case filePath.endsWith('.tag'):
          compileRiotTags(srcDir, inputTagDirs, outputTagsFile);
          break;

        case filePath.endsWith('.js'):
          compileAppJs(inputAppPaths, outputAppJsFile);
          break;
      }
    }))
    .then(() => {
      console.timeEnd('dev task');
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
    .then(() => {
      console.timeEnd('compile HTML');
      return true;
    });
}

/** copyLibraries copies the external libraries into our JS directory */
function copyLibraries(libsDir, outputLibsDir) {
  console.time('copy libraries');
  fse.copySync(libsDir, outputLibsDir);
  console.timeEnd('copy libraries');
  return Promise.resolve(true);
}

/**
 * compileRiotTags finds all Riot tags, compiles each one into ES2015+ JS, adds a source
 * reference, concatenates all of that and then transforms that into ES5 JS. This function
 * returns a Promise that is resolved when the full compilation is finished.
 */
function compileRiotTags(srcDir, inputTagDirs, outputFile) {
  console.time('compile Riot tags');

  const fileCompilations = util
    .getAllFiles(inputTagDirs, '.tag')
    .map(f => {
      return util.readFile(f)
        .then(tag => {
          let preBabelJS = riot.compile(tag);

          // this adds a source reference, because Riot doesn't produce a sourcemap AST yet
          preBabelJS = `// source: ${path.relative(srcDir, f)}\n${preBabelJS}`;
          return preBabelJS;
        });
    });

  return Promise.all(fileCompilations)
    .then(preBabelArr => {
      const esNextJs = preBabelArr.join('\n');
      const transformResult = babel.transform(esNextJs, { presets: ['es2015-riot'] });
      return util.writeFile(outputFile, transformResult.code);
    })
    .then(() => {
      console.timeEnd('compile Riot tags');
      return true;
    });
}

/**
 * compileAppJs takes as input the paths to directories and files that contain our application JS
 * and that are not Riot tags. This returns a Promise that is resolved when the full compilation
 * is complete.
 */
function compileAppJs(inputAppPaths, outputAppJsFile) {
  console.time('compile app.js');

  const inputFiles = util.getAllFiles(inputAppPaths);
  const fileReads = inputFiles.map(util.readFile);

  return Promise.all(fileReads)
    .then(fileContents => {
      // concatenates and creates a sourcemap
      const concat = new Concat(true, outputAppJsFile, '\n');
      fileContents.forEach((fileContent, i) => {
        const filePath = 'file://' + inputFiles[i];
        concat.add(filePath, fileContent);
      });

      // transform with Babel and modify the sourcemap
      const transformResult = babel.transform(concat.content, {
        presets: ['es2015-riot'],
        plugins: ['transform-object-rest-spread'],
        sourceMaps: true,
        inputSourceMap: JSON.parse(concat.sourceMap),
      });

      // add the sourcemap as an inline comment
      let sourcemapComment = '//# sourceMappingURL=data:application/json;base64,';
      sourcemapComment += new Buffer(JSON.stringify(transformResult.map)).toString('base64');

      return util.writeFile(outputAppJsFile, transformResult.code + '\n' + sourcemapComment);
    })
    .then(() => {
      console.timeEnd('compile app.js');
      return true;
    })
}

/**
 * watch will track changes on dirs, and run onChangeFn each time a change occurs. This function
 * return a Promise that is resolved when the watcher has been initiated.
 */
function watch(dirs, rootDir, onChangeFn) {
  console.time('watcher');

  return new Promise((resolve, reject) => {
    let isReady = false;

    chokidar
      .watch(dirs, { ignoreInitial: true })
      .on('ready', () => {
        for (let dir of dirs) {
          console.log(`watching ${path.relative(rootDir, dir)}...`);
        }

        isReady = true;
        console.timeEnd('watcher');
        resolve(true);
      })
      .on('error', err => {
        console.error(`Watcher error: ${err}`);
        if (!isReady) reject(err);
      })
      .on('all', (event, filePath) => {
        const time = (new Date()).toLocaleTimeString();
        console.log(`[${time}] ${event}: ${path.relative(rootDir, filePath)}`);
        onChangeFn(filePath);
      });
  });
}
