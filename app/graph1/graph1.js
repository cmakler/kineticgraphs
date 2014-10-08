'use strict';

angular.module('kineticGraphs.graph1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/graph1', {
    templateUrl: 'graph1/graph1.html'
  });
}])

.controller('Graph1Ctrl', function($scope) {

});