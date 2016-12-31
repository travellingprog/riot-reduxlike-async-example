Pod.define('containerMixin', ['store'], store => {
  /**
   * containerMixin is a Riot mixin for Riot tags that want to be Flux container components. It
   * adds the property "store", a reference to the store module. It expects a "readStoreState"
   * function to be defined, which gets called with the store's current state, and whenever any
   * change occurs to the store state.
   */

  return {
    init: function () {
      this.store = store;

      this.on('before-mount', () => {
        this.readStoreState(this.store.getState());
        this.store.on('change', this.readStoreState);
      });

      this.on('unmount', () => {
        this.store.off('change', this.readStoreState);
      });
    },
  };
});
