/// <reference path="../bower_components/DefinitelyTyped/jquery/jquery.d.ts" />
/// <reference path="../bower_components/DefinitelyTyped/jquery.color/jquery.color.d.ts" />
/// <reference path="../bower_components/DefinitelyTyped/angularjs/angular.d.ts"/>
/// <reference path="../bower_components/DefinitelyTyped/d3/d3.d.ts"/>
/// <reference path="../bower_components/DefinitelyTyped/underscore/underscore.d.ts"/>

/// <reference path="constants.ts" />
/// <reference path="helpers.ts" />

/// <reference path="model.ts" />
/// <reference path="restriction.ts" />

/// <reference path="math/math.ts" />

/// <reference path="viewObjects/viewObject.ts"/>
/// <reference path="viewObjects/point.ts"/>
/// <reference path="viewObjects/dropline.ts"/>

/// <reference path="viewObjects/curve.ts"/>
/// <reference path="viewObjects/segment.ts"/>
/// <reference path="viewObjects/arrow.ts"/>
/// <reference path="viewObjects/line.ts"/>
/// <reference path="viewObjects/graphDiv.ts"/>
/// <reference path="viewObjects/linePlot.ts"/>
/// <reference path="viewObjects/pathFamily.ts"/>
/// <reference path="viewObjects/functionPlot.ts"/>
/// <reference path="viewObjects/area.ts"/>

/// <reference path="view.ts" />
/// <reference path="views/axis.ts" />
/// <reference path="views/graph.ts" />
/// <reference path="views/twoVerticalGraphs.ts" />
/// <reference path="views/slider.ts" />

/// <reference path="controller.ts" />

/// <reference path="sample/sample.ts" />
/// <reference path="finance/fg.ts" />
/// <reference path="econ/eg.ts" />

'use strict';

angular.module('KineticGraphs', [])
    .controller('KineticGraphCtrl', ['$scope','$interpolate','$window',KG.Controller])
    .filter('percentage', ['$filter', function ($filter) {
        return function (input, decimals) {
            return $filter('number')(input * 100, decimals) + '\\%';
        };
    }]);