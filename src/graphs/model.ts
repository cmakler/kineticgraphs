/// <reference path="../../lib/jquery.d.ts" />
/// <reference path="../../lib/angular.d.ts" />

module KineticGraphs
{
    export interface ModelScope extends ng.IScope
    {
        min: number;
        max?: number;
    }

    export function Model(): ng.IDirective {
        return {
            restrict: 'E',
            template: '<div>Here in the model. <div ng-transclude/></div>',
            replace: true,
            transclude: true,
            link: (scope: ModelScope, element:JQuery, attributes) => {
                scope.min = attributes['min'];
            }
        }
    }
}

