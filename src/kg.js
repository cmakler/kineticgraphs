/// <reference path="../bower_components/DefinitelyTyped/jquery/jquery.d.ts"/>
/// <reference path="../bower_components/DefinitelyTyped/angularjs/angular.d.ts"/>
/// <reference path="../bower_components/DefinitelyTyped/d3/d3.d.ts"/>
/// <reference path="models/model.ts" />
/// <reference path="graphs/graph.ts" />
/// <reference path="composites/composite.ts" />
/// <reference path="primitives/primitive.ts" />
angular.module('KineticGraphs', []).directive('graph', KineticGraphs.graphDirective).directive('point', KineticGraphs.pointDirective).directive('axis', KineticGraphs.Axis);
//# sourceMappingURL=kg.js.map