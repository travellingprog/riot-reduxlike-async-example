const fse = require('fs-extra');

/**
 * getAllFiles takes an array of directories and/or filenames, and returns an array of filenames
 * within the directories with the right extension + the filenames given.
 */
module.exports = function getAllFiles(inputPaths, extension = '.js') {
  const files = [];

  if (typeof inputPaths === 'string') {
    inputPaths = [inputPaths];
  }

  for (let inputPath of inputPaths) {
    if (inputPath.endsWith(extension)) {
      files.push(inputPath);
    } else {
      // assume it's a directory, add all files inside with the right extension
      const filesInDir = fse.walkSync(inputPath)
        .filter(f => f.endsWith(extension));

      files.push(...filesInDir);
    }
  }

  return files;
}
