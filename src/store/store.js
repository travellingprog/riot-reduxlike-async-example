Pod.define('store', ['reducers'], function (reducers) {
  class Store {
    constructor(reducers) {
      riot.observable(this);
      this.reducers = reducers;
      this.state = this.useReducers(); // get default state
      this.dispatch = this.dispatch.bind(this);
    }

    dispatch(action) {
      const newState = this.useReducers(action);

      if (!this.equalStates(newState, this.state)) {
        this.state = newState;
        this.trigger('change', this.state);
      }
    }

    getState() {
      return this.state;
    }

    useReducers(action = { type: '' }) {
      const newState = {};
      const curState = this.state || {};
      for (let key in this.reducers) {
        let reducer = this.reducers[key];
        newState[key] = reducer(curState[key], action);
      }
      return newState;
    }

    /**
     * equalStates checks if two states have the same values. This code is adapted from
     * the deep equal object comparison function in the following gist:
     * https://gist.github.com/nicbell/6081098#file-object-compare-js
     */
    equalStates(state1, state2) {
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
