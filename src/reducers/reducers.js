Pod.define('reducers', ['actions'], actions => {
  /**
   * reducers exports the Redux reducers that compute a store's state. Each reducer defines its
   * default value.
   */
  let exports = {};
  const { SELECT_REDDIT, INVALIDATE_REDDIT, REQUEST_POSTS, RECEIVE_POSTS } = actions;

  /** selectedReddit is the subreddit selected by the user */
  exports.selectedReddit = (state = 'riotjs', action) => {
    switch (action.type) {
      case SELECT_REDDIT:
        return action.reddit;
      default:
        return state;
    }
  };

  /**
   * posts defines the state of a subreddit's posts: are they being fetched? are the posts in the
   * cache invalid? etc.
   */
  function posts(state = {
    isFetching: false,
    didInvalidate: false,
    items: []
  }, action) {
    switch (action.type) {
      case INVALIDATE_REDDIT:
        return {
          ...state,
          didInvalidate: true
        };
      case REQUEST_POSTS:
        return {
          ...state,
          isFetching: true,
          didInvalidate: false
        };
      case RECEIVE_POSTS:
        return {
          ...state,
          isFetching: false,
          didInvalidate: false,
          items: action.posts,
          lastUpdated: action.receivedAt
        };
      default:
        return state;
    }
  }

  /** postsByReddit is a map of subreddits to their posts' state */
  exports.postsByReddit = (state = { }, action) => {
    switch (action.type) {
      case INVALIDATE_REDDIT:
      case RECEIVE_POSTS:
      case REQUEST_POSTS:
        return {
          ...state,
          [action.reddit]: posts(state[action.reddit], action)
        };
      default:
        return state;
    }
  };

  return Object.freeze(exports);
});
