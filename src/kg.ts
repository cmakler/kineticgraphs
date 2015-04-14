/// <reference path="../lib/jquery.d.ts"/>
/// <reference path="../lib/angular.d.ts"/>
/// <reference path="../lib/d3.d.ts"/>

/// <reference path="graphs/graph.ts" />
/// <reference path="graphs/model.ts" />


angular.module('KineticGraphs', [])
    .directive('graph', KineticGraphs.Graph)
    .directive('point', KineticGraphs.pointDirective)
    .directive('axis', KineticGraphs.Axis);