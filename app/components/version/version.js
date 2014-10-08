'use strict';

angular.module('kineticGraphs.version', [
  'kineticGraphs.version.interpolate-filter',
  'kineticGraphs.version.version-directive'
])

.value('version', '0.1');
