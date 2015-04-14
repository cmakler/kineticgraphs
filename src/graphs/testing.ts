/// <reference path="../../lib/jquery.d.ts" />
/// <reference path="../../lib/angular.d.ts" />

module KineticGraphs
{
    export interface OuterScope extends ng.IScope
    {
        min: number;
        max: number;
        addMax: (number) => void;
    }

    export class OuterController
    {
        constructor(public $scope: OuterScope) {
            $scope.min = 0;
        }

        addMax = function(max: number) {
            this.$scope.max = max;
        }
    }

    export function Outer(): ng.IDirective {

        function link(scope: OuterScope, element:JQuery, attributes) {
            scope.min = attributes['min'];
        }

        return {
            restrict: 'E',
            template: '<div>Min is {{min}}, max is {{max}}<span ng-transclude/></div>',
            replace: true,
            transclude: true,
            link: link,
            controller: OuterController
        }
    }

    export function Inner(): ng.IDirective {
        return {
            restrict: 'E',
            require: '^outer',
            link: (scope: ng.IScope, element:JQuery, attributes, outerscope: OuterScope) => {
                var max = attributes.max;
                console.log('setting max to '+ max);
                outerscope.addMax(attributes['max']);
            }
        }
    }
}

