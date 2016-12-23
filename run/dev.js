#!/usr/bin/env node

const babel = require('babel-core');
const fse = require('fs-extra');
const path = require('path');
const riot = require('riot');
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
  const inputTagDirs = [srcDir + '/components', srcDir + '/containers'];

  const buildDir = rootDir + '/build';
  const outputPage = buildDir + '/index.html';
  const outputLibsDir = buildDir + '/assets/js/libs';
  const outputTagsFile = buildDir + '/assets/js/tags.js'

  fse.removeSync(buildDir);

  compileHtml(inputPage, outputPage)
    .then(() => copyLibraries(libsDir, outputLibsDir))
    .then(() => compileRiotTags(srcDir, inputTagDirs, outputTagsFile))
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

  const inputFiles = [];
  for (let dir of inputTagDirs) {
    inputFiles.push(...fse.walkSync(dir));
  }

  const fileCompilations = inputFiles.map(f => {
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
