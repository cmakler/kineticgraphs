'use strict';

// Declare app level module which depends on views, and components
angular.module('kineticGraphs', [
  'ngRoute',
  'kineticGraphs.model',
  'kineticGraphs.graph1',
  'kineticGraphs.graph2',
  'kineticGraphs.version'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/graph1'});
}]);
