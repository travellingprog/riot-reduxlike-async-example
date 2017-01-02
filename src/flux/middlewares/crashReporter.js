Pod.define('middleware/crashReporter', () => {
  /**
   * crashReporter is a middleware example. It catches any error that occurs on dispatch and
   * stores in localStorage. Usually, an error catcher like this would call an external report API
   */
  return function crashReporter(store, next, action) {
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
});
