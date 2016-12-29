/* polyfills present: fetch, Promise */

/* global objects: Pod, riot */
Pod.declare('riot', riot);

/* start point */
Pod.require(['riot', 'containerMixin'], (riot, containerMixin) => {
  riot.mixin('container', containerMixin);
  riot.mount('app');
});
