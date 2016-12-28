<app>
  <picker
    value={ selectedReddit }
    onPickerChange={ handleChange }
    options={ ['reactjs', 'frontend'] }
  />
  <p>
    <span if={ lastUpdated }>
      Last updated at { new Date(lastUpdated).toLocaleTimeString() }.
      {' '}
    </span>
    <a if={ !isFetching } href="#" onClick={ handleRefreshClick }>
      Refresh
    </a>
  </p>
  <virtual if={ isEmpty }>
    <h2 if={ isFetching  }>Loading...</h2>
    <h2 if={ !isFetching }>Empty</h2>
  </virtual>
  <div if={ !isEmpty } style="opacity: { isFetching ? 0.5 : 1 }">
    <posts data={ posts } />
  </div>

  <script>
    const { fetchPostsIfNeeded, invalidateReddit, selectReddit } = Pod.require('actions');

    /* View Model */
    this.selectedReddit = '';
    this.posts = [];
    this.isFetching = false;
    this.lastUpdated = null;

    /* Flux Boilerplate (could be a mixin) */
    this.store = Pod.require('store');

    this.on('before-mount', () => {
      this.readStoreState(this.store.getState());
      this.store.on('change', this.readStoreState);
    });

    this.on('unmount', () => {
      this.store.off('change', this.readStoreState);
    });

    /** readStoreState maps the store state to updates for our component's view model */
    readStoreState(state) {
      const { selectedReddit, postsByReddit } = state;
      const postsObj = postsByReddit[selectedReddit] || { isFetching: true, items: [] };
      const { isFetching, lastUpdated, items: posts } = postsObj;

      const updates = {
        selectedReddit,
        posts,
        isFetching,
        lastUpdated,
      };

      this.checkUpdates(updates);
      this.update(updates);
    }

    /** checkUpdates responds to some updates with action dispatches */
    checkUpdates(updates) {
      if (updates.selectedReddit !== this.selectedReddit) {
        fetchPostsIfNeeded(this.store, updates.selectedReddit);
      }
    }

    handleChange(nextReddit) {
      this.store.dispatch(selectReddit(nextReddit));
    }

    handleRefreshClick(e) {
      e.preventDefault();
      this.store.dispatch(invalidateReddit(this.selectedReddit));
      fetchPostsIfNeeded(this.store, this.selectedReddit);
    }
  </script>
</app>
