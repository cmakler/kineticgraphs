/// <reference path="../bower_components/DefinitelyTyped/jquery/jquery.d.ts" />
/// <reference path="../bower_components/DefinitelyTyped/angularjs/angular.d.ts"/>
/// <reference path="../bower_components/DefinitelyTyped/d3/d3.d.ts"/>

/// <reference path="graphs/graph.ts" />
/// <reference path="model/model.ts" />
/// <reference path="controls/control.ts" />


angular.module('KineticGraphs', [])
    .controller('KineticGraphCtrl', KineticGraphs.ModelController)