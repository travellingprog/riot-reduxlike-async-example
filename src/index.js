// global objects: Pod, riot
Pod.declare('riot', riot);

Pod.require(['riot'], function (riot) {
  riot.mount('app');
});
