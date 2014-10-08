'use strict';

angular.module('kineticGraphs.graph2', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/graph2', {
    templateUrl: 'graph2/graph2.html',
    controller: 'Graph2Ctrl'
  });
}])

.controller('Graph2Ctrl', [function() {

}]);