/// <reference path="../typings/tsd.d.ts"/>
/// <reference path="../bower_components/dt-d3/d3.d.ts"/>

/// <reference path="constants.ts" />
/// <reference path="helpers/helpers.ts" />
/// <reference path="helpers/definitions.ts" />

/// <reference path="model.ts" />
/// <reference path="helpers/domain.ts" />
/// <reference path="restriction.ts" />

/// <reference path="math/math.ts" />

/// <reference path="viewObjects/viewObject.ts"/>
/// <reference path="viewObjects/point.ts"/>
/// <reference path="viewObjects/dropline.ts"/>

/// <reference path="viewObjects/curve.ts"/>
/// <reference path="viewObjects/segment.ts"/>
/// <reference path="viewObjects/arrow.ts"/>
/// <reference path="viewObjects/line.ts"/>
/// <reference path="viewObjects/piecewiseLinear.ts"/>
/// <reference path="viewObjects/graphDiv.ts"/>
/// <reference path="viewObjects/linePlot.ts"/>
/// <reference path="viewObjects/pathFamily.ts"/>
/// <reference path="viewObjects/functionPlot.ts"/>
/// <reference path="viewObjects/functionMap.ts"/>
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
/// <reference path="physics/pg.ts"/>

'use strict';

angular.module('KineticGraphs', [])
    .controller('KineticGraphCtrl', ['$scope','$interpolate','$window',KG.Controller])
    .filter('percentage', ['$filter', function ($filter) {
        return function (input, decimals) {
            return $filter('number')(input * 100, decimals) + '\\%';
        };
    }])
    .filter('extendedReal', ['$filter', function ($filter) {
        return function (input, decimals) {
            if(input == Infinity) {
                return '\\infty'
            } else if(input == -Infinity) {
                return '-\\infty'
            } else
                return $filter('number')(input, decimals);
        };
    }])
    .directive('toggle', function () {

        function link(scope, el, attrs) {

            scope.toggle = function() {
                scope.params[attrs.param] = !scope.params[attrs.param];
            };

        }

        return {
            link: link,
            restrict: 'E',
            replace: true,
            scope: true,
            transclude: true,
            template: "<button ng-click='toggle()' style='width: 100%'><span ng-transclude/></button>"
        };
    });