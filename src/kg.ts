/// <reference path="../bower_components/DefinitelyTyped/jquery/jquery.d.ts" />
/// <reference path="../bower_components/DefinitelyTyped/jquery.color/jquery.color.d.ts" />
/// <reference path="../bower_components/DefinitelyTyped/angularjs/angular.d.ts"/>
/// <reference path="../bower_components/DefinitelyTyped/d3/d3.d.ts"/>
/// <reference path="../bower_components/DefinitelyTyped/underscore/underscore.d.ts"/>

/// <reference path="helpers.ts" />

/// <reference path="model.ts" />
/// <reference path="restriction.ts" />

/// <reference path="viewObjects/viewObject.ts"/>
/// <reference path="viewObjects/point.ts"/>
/// <reference path="viewObjects/segment.ts"/>
/// <reference path="viewObjects/label.ts"/>
/// <reference path="viewObjects/linePlot.ts"/>
/// <reference path="viewObjects/pathFamily.ts"/>

/// <reference path="view.ts" />
/// <reference path="views/axis.ts" />
/// <reference path="views/graph.ts" />

/// <reference path="controller.ts" />

/// <reference path="sample/sample.ts" />

'use strict';

angular.module('KineticGraphs', [])
    .controller('KineticGraphCtrl', KineticGraphs.Controller);