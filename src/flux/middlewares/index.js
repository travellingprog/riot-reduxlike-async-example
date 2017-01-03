Pod.define('middlewares',
  [
    'env',
    'middleware/crashReporter',
    'middleware/logger',
  ],
  (env, crashReporter, logger) => {
    /**
     * middlewares returns an array of Redux-like middleware functions for our store. The first
     * function in the array will wrap the second one, which will wrap the third one, and so on.
     */

    if (env.mode === 'prod') {
      return []; // set no middleware in our production build
    } else {
      return [
        crashReporter,
        logger,
      ];
    }
  }
);
