# Riot, Redux-like, Minimal Async Application

In this project, I'm recreating Redux's [async example](https://github.com/reactjs/redux/tree/master/examples/async), but I'm using [Riot](http://riotjs.com/), my own Redux-like Flux implementation and I'm **not** using any module bundler (like Webpack or Browserify).

This is a proof of concept for the sake of research, and this is basically a follow-up to the research I did with my [Interview Generator](https://github.com/travellingprog/interview-generator) application.

## Install And Run

This project is meant to be run with Node v6 and Yarn v0.x. You can install all the dependencies by running:

```sh
yarn
```

You can run the application in **development mode**, which compiles the application, watches for file changes, starts a static server and opens a browser window to view the page:

```sh
node run/dev
```

You can also run the application in **production mode**, which compiles a minified build, starts a static server and opens a browser window to view the page:

```sh
node run/prod
```

## Research Purpose

### Stripping Down The Build Toolchain

I wanted to see what it would be like to create a build toolchain for front-end development *without* the use of the popular/conventional build tools, but just by making use of the transformational Node modules (like Babel) directly.

Through the years, I've used about every build tool that you can think of: Webpack, Browserify, Gulp, Grunt, Brocolli, Makefiles, etc. I've never been fully satisfied by any of them. I've come to the conclusion that no development toolchain will "just work", there will always be some point where you'll need rack your brain to figure why X build tool isn't outputting what you're expecting, why it's taking so long run a certain task or why it's taking so much to just initiate before running a task.

The biggest issue when running into these toolchain problems is that you have very little visibility. You're using a tool (Webpack, Gulp, etc) with a big codebase, paired with a bunch of plugins for each little subtask that you want to run, all outputting log or error messages of their choosing. Sometimes these plugins are not well maintained and fall behind the underlying compiler module. On top of that, in the last few years of JavaScript development, *module bundlers* (Webpack, Browserify, Rollup) have become, in some ways, too "all-encompassing".

### Building With A Simpler Module Tool

ES2015 modules are quite neat, but they don't work as-is in the browser without adding something like [SystemJS](https://github.com/systemjs/systemjs). Most developers therefore make use of one of the module bundlers I mentioned above.

However, before ES2015 modules and Browserify came to exist, JavaScript developers we're already writing modular code, using things like RequireJS (which has its own headaches, for sure). Years ago, I was tasked with creating a tiny, lightweight web application, so I decided to explore the world of JavaScript microlibraries. I came across and made use of [Pods.js](https://github.com/gmac/pods.js), a tiny (<2 Kb), synchronous module management library. The library has some caveats (no circular dependencies, for example), but it was delightful to use because of how *easy* it was to use. Creating my JS build mostly involved concatenating my modules together in the right order.

Since then, I've wondered how Pods would up if applied to a bigger application. So this project is an exploration of that idea: how do you approach making an application with modern JavaScript and modern libraries, but by making use of a synchronous module system like Pods?

### Rethinking Redux

Redux has some great ideas. Putting the entire application state inside of a single Flux store makes sense. Making use of modular reducer functions to compute the state also seems like a good approach. Where I disagree is in how Asynchronous Action Creators are approached. 

Basically, Redux guidelines indicate that every asynchronous action creator should have the ability to dispatch 3 different actions: one to signal the start of the action, one to signal a successful result and one to signal an error. However, to achieve that, Redux believes you should add a middleware layer, with [thunk-middleware](https://github.com/gaearon/redux-thunk) being the most common.

Here's an example from Redux's async example:

```
/** containers/App.js */
dispatch(fetchPostsIfNeeded(selectedReddit))

/** actions/index.js */
const fetchPosts = reddit => dispatch => {
  dispatch(requestPosts(reddit))    // requestPosts() is a sync action creator
  return fetch(`https://www.reddit.com/r/${reddit}.json`)
    .then(response => response.json())
    .then(json => dispatch(receivePosts(reddit, json)))
}

const shouldFetchPosts = (state, reddit) => {
  // returns true or false, based on state
}

export const fetchPostsIfNeeded = reddit => (dispatch, getState) => {
  if (shouldFetchPosts(getState(), reddit)) {
    return dispatch(fetchPosts(reddit))
  }
}
```

So, `fetchPostsIfNeeded()`, an asynchronous action creator, doesn't return an action, but a function (the "thunk") that accepts a `dispatch` and `getState` function as arguments. The dispatch function is then fed another asynchronous action creator, `fetchPosts()`, that also returns a thunk.

In my opinion, this could be greatly simplified and doesn't need the use of middleware. All you need to do is pass the Store to the asynchronous action creator.

## Findings

### Faster, More Flexible Build Tool

By making use of the Node modules directly, my hope was that I would achieve very fast build times. I'm glad to say that this is indeed the case, my first builds typically take about 5 seconds on my 2013 Macbook Pro, and that includes starting and navigating to a static server. Subsequent builds are even faster, under 2 seconds.

More importantly, because I created my build scripts myself, and all that code is right there in the repository, it's much easier for me to address any problems I come across and modify any build step.

A good example to illustrate this is in my production build script. I wanted the filenames of the JavaScript files to contain a hash created from the file contents, for browser cache busting. I then wanted those filenames to be injected into my `index.html` source file *before* it gets processed by [useref](https://github.com/jonkemp/useref). To achieve that with Gulp or Webpack plugins would have been... difficult. Not impossible, but certainly not straightforward. But in my custom Node build scripts, because I had a ton of flexibility, it was quite easy to implement.

### Smaller Application Size

The Redux async example application is very small, and yet the production build loads 186 kB of JavaScript. The development build is much bigger than that. And that's despite the fact that the application makes use of [create-react-app](https://github.com/facebookincubator/create-react-app), which implements a bunch of Webpack build optimizations.

On the other hand, my application loads 41 kB of JavaScript, **a reduction of 78%**! And on top of that, only 6 kB of that load represent my application code, the rest is external libraries. That's despite the fact that the only minification tool I'm making use of is UglifyJS.

### Lack of Sourcemaps

One drawback I discovered is that the Riot compiler does not have the ability to produce a sourcemap. There's an [open issue](https://github.com/riot/compiler/issues/56) about this, and hopefully it gets addressed for the next version of the compiler, but it certainly has a noticeable negative impact on the development experience. Some work is underway on this front, and I may decide to contribute to it, or I may look at other tiny UI libraries, like [Vue](https://github.com/vuejs/vue) or [Preact](https://github.com/developit/preact). Unfortunately, developing with those other libraries requires also making use of a module bundler like Browserify or Webpack, which is something I wanted to avoid.

### Loading Babel Is Very Slow

I was willing to sacrifice the use of ES2015 modules, but not ES2015 altogether. Thus, I had to make use of Babel. Unfortunately, I've found that simply importing babel-core for the first time adds a significant amount of time to my build compilations. While a build only takes me about 5 seconds, 2-3 of those seconds will just be spend on importing babel-core. An initial Babel compilation also seems to take significantly more time than subsequent compilations. I wasn't able to figure out why importing Babel took so long, or why it was so much faster afterward the initial use, but if anyone wants to create a modern JS build tool that feels nearly instantaneous, they'll have to face this obstacle as well.

### Custom Redux-y Flux Implementation

Using Riot's built-in [Observable](http://riotjs.com/api/observable/) mixin, I was able to create a Flux store that functions very closely like the one provided by Redux. It uses an object of reducers to compute the store's state, and an array of middleware functions can set on dispatches. 

The middleware function's signature is simpler in my implementation:
```js
// my version
function middleware(store, next, action) {
    const prevState = store.getState();
    let result = next(action);
    const nextState = store.getState();
}

// compared to the Redux version...
function middleware(store) {
    return function (next) {
        return function (action) {
            const prevState = store.getState();
            let result = next(action);
            const nextState = store.getState();
        }
    }
}
```

I should note that although Redux's version is more complex, it does offer more capabilities. For example, a middleware function can call `store.dispatch(action)` in Redux, and "the action will actually travel the whole middleware chain again, including the current middleware".

I created a logger middleware which is essentially a clone of Redux-logger's default behaviour, although it does not offer any options whatsoever. I also created a "crash Reporter" middleware, although at this point all it does is store error messages (from dispactches) inside of LocalStorage.

Another notable difference in my implementation is how [async action creators](http://redux.js.org/docs/advanced/AsyncActions.html#async-action-creators) work. With Redux, you use something like [thunk-middleware](https://github.com/gaearon/redux-thunk) to achieve this. In my implementation, you simply pass the whole store as the first argument of the creator function:

```js
// Compare this to the Redux example in the "Rethinking Redux" section above

/** src/containers/app.tag */
fetchPostsIfNeeded(this.store, this.selectedReddit);

/** src/flux/actions.js */
function fetchPosts(dispatch, reddit) {
  dispatch(exports.requestPosts(reddit));
  return fetch(`https://www.reddit.com/r/${reddit}.json`)
    .then(response => response.json())
    .then(json => dispatch(exports.receivePosts(reddit, json)));
}

const shouldFetchPosts = (state, reddit) => {
  // returns true or false, based on state
}

exports.fetchPostsIfNeeded = (store, reddit) => {
  if (shouldFetchPosts(store.getState(), reddit)) {
    return fetchPosts(store.dispatch, reddit);
  }
};
```

I should also note that although my Flux store made use of Riot's Observable mixin, I could have built it with any event emitter (like [mitt](https://github.com/developit/mitt)).

### Diffulty Importing Third-Party Modules

The biggest difficulty I saw with abandoning the use of a module bundler (like Browserify, Webpack or Rollup) was the importing of third-party modules. Because module bundlers have become a standard tool in front-end development, many third-party client-side modules these days are written like NodeJS modules. Unfortunately, [Pods.js](https://github.com/gmac/pods.js) has no capability of loading NodeJS-type modules, nor ES6-type modules. It would not take too much work to create a Pods wrapper for UMD modules, but unfortunately UMD seems to have become a lot less popular in the past few years.

Therefore, I must conclude that foregoing a module bundler likely means running into obstacles if you wish to use a third-party frontend modules.

## Possible Future Improvements

- create time-travel middleware
- add a code linter
 
