Pod.define('actions', () => {
  let exports = {};

  exports.REQUEST_POSTS = 'REQUEST_POSTS';
  exports.RECEIVE_POSTS = 'RECEIVE_POSTS';
  exports.SELECT_REDDIT = 'SELECT_REDDIT';
  exports.INVALIDATE_REDDIT = 'INVALIDATE_REDDIT';

  exports.selectReddit = reddit => ({
    type: exports.SELECT_REDDIT,
    reddit,
  });

  exports.invalidateReddit = reddit => ({
    type: exports.INVALIDATE_REDDIT,
    reddit,
  });

  exports.requestPosts = reddit => ({
    type: exports.REQUEST_POSTS,
    reddit,
  });

  exports.receivePosts = (reddit, json) => ({
    type: exports.RECEIVE_POSTS,
    reddit,
    posts: json.data.children.map(child => child.data),
    receivedAt: Date.now(),
  });

  function fetchPosts(store, reddit) {
    console.log('reddit', reddit);
    store.dispatch(exports.requestPosts(reddit));
    return fetch(`https://www.reddit.com/r/${reddit}.json`)
      .then(response => response.json())
      .then(json => store.dispatch(exports.receivePosts(reddit, json)));
  }

  function shouldFetchPosts(state, reddit) {
    const posts = state.postsByReddit[reddit];
    if (!posts) {
      return true;
    }
    if (posts.isFetching) {
      return false;
    }
    return posts.didInvalidate;
  }

  exports.fetchPostsIfNeeded = (store, reddit) => {
    if (shouldFetchPosts(store.getState(), reddit)) {
      return fetchPosts(store, reddit);
    }
  };

  return Object.freeze(exports);
});
