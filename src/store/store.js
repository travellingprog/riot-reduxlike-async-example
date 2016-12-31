Pod.define('store', ['reducers'], function (reducers) {
  /**
   * store returns an instance of a Redux-like store. It's can be put into any project where a
   * reducers module is defined. Only the dispatch() and getState() functions should be used by
   * external modules.
   */

  class Store {
    constructor(reducers) {
      riot.observable(this);
      this.reducers = reducers;
      this.state = this.useReducers(); // get default state
      this.dispatch = this.dispatch.bind(this);
    }

    /**
     * dispatch is used by external modules to deliver an action to the reducers. If the new state
     * is different from the current state, the change event is triggered.
     */
    dispatch(action) {
      const newState = this.useReducers(action, this.state);

      if (!this.equalStates(newState, this.state)) {
        this.state = newState;
        this.trigger('change', this.state);
      }
    }

    /** getState returns the store's current state */
    getState() {
      return this.state;
    }

    /**
     * useReducers passes an action through all the reducers, along with the current state, to
     * compose a new store state.
     */
    useReducers(action = { type: '' }, curState = {}) {
      const newState = {};
      for (let key in this.reducers) {
        let reducer = this.reducers[key];
        newState[key] = reducer(curState[key], action);
      }
      return newState;
    }

    /** equalStates checks if two states have the same values, assuming they are plain objects */
    equalStates(state1, state2) {
      // This code is adapted from the deep equal object comparison function in the following gist:
      // https://gist.github.com/nicbell/6081098#file-object-compare-js

      for (var p in state1) {
        if (!state2.hasOwnProperty(p)) return false;

        switch (typeof (state1[p])) {
          case 'object':
            if (!this.equalStates(state1[p], state2[p])) return false;
            break;

          default:
            if (state1[p] != state2[p]) return false;
        }
      }

      //Check object 2 for any extra properties
      for (var p in state2) {
        if (typeof (state1[p]) == 'undefined') return false;
      }

      return true;
    }
  }

  return new Store(reducers);
});
