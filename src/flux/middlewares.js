Pod.define('middlewares', () => {
  /**
   * middlewares returns an array of Redux-like middleware functions for our store. The first
   * function in the array will wrap the second one, which will wrap the third one, and so on.
   */

  return [
    crashReporter,
    logger,
  ];

  /**
   * crashReporter is an middleware example. It catches any error that occurs on dispatch and
   * stores in localStorage. Usually, an error catcher like this would call an external report API
   */
  function crashReporter(store, next, action) {
    try {
      return next(action);
    } catch (err) {
      const storedErrors = localStorage.getItem('errors');
      let errors = storedErrors ? JSON.parse(storedErrors) : [];
      errors.push({
        date: (new Date()).toISOString(),
        message: err.toString(),
        action,
        state: store.getState(),
      });
      errors = errors.slice(0, 10); // only keep last 10 errors
      localStorage.setItem('errors', JSON.stringify(errors));
      throw err;
    }
  }

  /** logger outputs info to the console about each dispatch, and its effect on state */
  function logger(store, next, action) {
    console.log('dispatching', action);
    let result = next(action);
    console.log('next state', store.getState());
    return result;
  }
});
