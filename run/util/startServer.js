const finalhandler = require('finalhandler');
const http = require('http');
const opn = require('opn');
const serveStatic = require('serve-static');

/** startServer begins a static server and opens the root path in the browser */
module.exports = function startServer(dir, port, isProd) {
  console.time('static server');

  return new Promise((resolve, reject) => {
    let isReady = false;
    const serve = serveStatic(dir, {
      maxAge: isProd ? 10 * 365 * 24 * 60 * 60 * 1000 : 0,
    });

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
