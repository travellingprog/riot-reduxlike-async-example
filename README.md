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



Missing in Dev UX:
- sourcemaps for our components (because of Riot compiler)
- PropTypes
- redux logger with tons of options


## Possible Future Improvements

- create time-travel middleware
- add a code linter
 
