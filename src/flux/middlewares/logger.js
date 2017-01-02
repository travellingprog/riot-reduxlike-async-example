Pod.define('middleware/logger', () => {
  /** logger outputs info to the console about each dispatch, and its effect on state */
  return function logger(store, next, action) {
    console.log('dispatching', action);
    let result = next(action);
    console.log('next state', store.getState());
    return result;
  }
});
