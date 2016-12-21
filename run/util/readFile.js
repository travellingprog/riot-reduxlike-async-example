const fs = require('fs');

/** readFile returns a Promise that is resolved with the string content of a file that is read */
module.exports = function readFile(f) {
	return new Promise((resolve, reject) => {
		fs.readFile(f, 'utf8', (err, data) => {
			if (err) {
				reject(err);
			} else {
				resolve(data);
			}
		});
	});
}