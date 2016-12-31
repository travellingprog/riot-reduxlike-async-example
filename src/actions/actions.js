Pod.define('actions', () => {
  /** actions exports an object of Flux actions types and action creators */
  let exports = {};

  /* Action Types */
  exports.REQUEST_POSTS = 'REQUEST_POSTS';
  exports.RECEIVE_POSTS = 'RECEIVE_POSTS';
  exports.SELECT_REDDIT = 'SELECT_REDDIT';
  exports.INVALIDATE_REDDIT = 'INVALIDATE_REDDIT';

  /* Synchronous Action Creators, one for each type */
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

  /* Async Action Creators */

  /** fetchPosts retrieves JSON data about a subreddit, from the Reddit API */
  function fetchPosts(dispatch, reddit) {
    dispatch(exports.requestPosts(reddit));
    return fetch(`https://www.reddit.com/r/${reddit}.json`)
      .then(response => response.json())
      .then(json => dispatch(exports.receivePosts(reddit, json)));
  }

  /**
   * shouldFetchPosts checks if we have posts for this subreddit in our cache, or if we should
   * fetch them from the Reddit API.
   */
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

  /** fetchPostsIfNeeded fetches subreddit posts from the API unless we have them in cache */
  exports.fetchPostsIfNeeded = (store, reddit) => {
    if (shouldFetchPosts(store.getState(), reddit)) {
      return fetchPosts(store.dispatch, reddit);
    }
  };

  return Object.freeze(exports);
});
