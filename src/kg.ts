/// <reference path="../bower_components/DefinitelyTyped/jquery/jquery.d.ts" />
/// <reference path="../bower_components/DefinitelyTyped/jquery.color/jquery.color.d.ts" />
/// <reference path="../bower_components/DefinitelyTyped/angularjs/angular.d.ts"/>
/// <reference path="../bower_components/DefinitelyTyped/d3/d3.d.ts"/>



/// <reference path="model.ts" />
/// <reference path="helpers.ts" />
/// <reference path="interactives/interactive.ts" />
/// <reference path="interactives/axis.ts" />
/// <reference path="interactives/graph.ts" />
/// <reference path="interactives/slider.ts" />
/// <reference path="graphObjects/graphObjects.ts" />
/// <reference path="graphObjects/point.ts" />
/// <reference path="graphObjects/controlPoint.ts" />
/// <reference path="graphObjects/linePlot.ts" />
/// <reference path="graphObjects/scatter.ts" />

/// <reference path="finance/asset.ts"/>
/// <reference path="finance/portfolio.ts"/>


angular.module('KineticGraphs', [])
    .controller('KineticGraphCtrl', KineticGraphs.ModelController)