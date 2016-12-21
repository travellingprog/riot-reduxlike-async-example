const fs = require('fs-extra');

/** writeFile returns a Promise that is resolved when "content" is written to the filePath */
module.exports = function writeFile(filePath, content) {
	return new Promise((resolve, reject) => {
		fs.outputFile(filePath, content, err => {
			if (err) {
				reject(err);
			} else {
				resolve(true);
			}
		});
	});
}
