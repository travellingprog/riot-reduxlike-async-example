Pod.define('containerMixin', ['store'], store => {
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
