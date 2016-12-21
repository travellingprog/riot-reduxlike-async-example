function Store() {
	// BOILERPLATE START

	constructor() {
		riot.observable(this);

		this.state = _getInitialState();

		this.on('action', action => {
			const newState = this._getNewState(action);
			if (!equal(newState, this.state)) {
				this.state = newState;
				this.trigger('change', this.state);
			}
		});

		this.dispatch = this.dispatch.bind(this);
	}

	dispatch(action) {
		this.trigger('action', action);
	}

	getState() {
		return this.state;
	}

	// BOILERPLATE END

	_getInitialState() {
		return {
			posts: [],
			lastUpdate: 24435634565,
		};
	}

	_getNewState(action) {
		return {
			// posts and lastUpdate are reducers
			posts: posts(this.state.posts, action),
			lastUpdate: lastUpdate(this.state.lastUpdate, action),
		};
	}
}



/**
 * inside of Riot tag
 */
import store from './store';
import { addPost } from './actions/sync';
import { fetchMyPosts } from './actions/async';

function Tag() {
	this.posts = [];

	this.on('mount', () => {
		store.on('change', onStoreChange);  // equivalent to subscribing to a Redux store
	});

	this.on('unmount', () => {
		store.off('change', onStoreChange);
	});

	onStoreChange(newState) {
		this.update({ posts: newState.posts });
	}

	submitNewPost(postText, author) {
		// equivalent to a sync dispatch, addPost() is a Redux synchronous action creator
		store.dispatch(addPost(postText, author));
	}

	getMyPosts(author) {
		// equivalent to an async dispatch, fetchPosts is a Redux async action creator,
		// but we don't use a thunk, we just pass the store object as the first argument
		fetchMyPosts(store, author).then(() => {
			console.log(`Fetched the posts for ${author}`);
		});
	}
}


/**
 * actions/async.js
 * The first argument of all functions will be the Store, but we should only use it for
 * store.dispatch and store.
 * These actions creators basically just do asynchronous actions in between calling synchronous
 * action creators.
 * All async action creators should return a Promise.
 */

 import { receivePosts, requestPosts } from './sync';  // synchronous action creators

//
export function fetchMyPosts(store, author) {
	store.dispatch(requestPosts(author));

	return fetch(`http://www.reddit.com/u/${author}.json`)
		.then(response => response.json())
		.then(json => store.dispatch(receivePosts(author, json)));
}

