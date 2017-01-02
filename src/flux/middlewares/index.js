Pod.define('middlewares',
  [
    'middleware/crashReporter',
    'middleware/logger',
  ],
  (crashReporter, logger) => {
    /**
     * middlewares returns an array of Redux-like middleware functions for our store. The first
     * function in the array will wrap the second one, which will wrap the third one, and so on.
     */

    return [
      crashReporter,
      logger,
    ];
  }
);
