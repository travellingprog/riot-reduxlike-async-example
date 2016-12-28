/* polyfills present: fetch, Promise */

/* global objects: Pod, riot */
Pod.declare('riot', riot);

/* start point */
Pod.require(['riot'], function (riot) {
  riot.mount('app');
});
