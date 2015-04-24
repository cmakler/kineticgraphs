/// <reference path="../bower_components/DefinitelyTyped/jquery/jquery.d.ts" />
/// <reference path="../bower_components/DefinitelyTyped/angularjs/angular.d.ts"/>
/// <reference path="../bower_components/DefinitelyTyped/d3/d3.d.ts"/>

/// <reference path="graph.ts" />
/// <reference path="model.ts" />
/// <reference path="slider.ts" />


angular.module('KineticGraphs', [])
    .controller('KineticGraphCtrl', KineticGraphs.ModelController)