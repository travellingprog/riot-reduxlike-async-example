Pod.define('middleware/logger', () => {
  /**
   * logger outputs info to the console about each dispatch, and its effect on state. It's really a
   * Redux Logger clone, but without any options or copied source code. This might cause issues in
   * browsers that don't support colored console msgs or console.groupCollapsed()/groupEnd().
   */
  return function logger(store, next, action) {
    const prevState = store.getState();
    let result = next(action);
    const nextState = store.getState();

    const d = new Date();
    const time = `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}.${d.getMilliseconds()}`;
    console.groupCollapsed(`action @ ${time} ${action.type}`);
    console.log('%cprev state', 'font-weight: bold; color: #8a8a8a', prevState);
    console.log('%caction', 'font-weight: bold; color: #0095f5', action);
    console.log('%cnext state', 'font-weight: bold; color: #3c9d3a', nextState);
    console.groupEnd();

    return result;
  }
});
