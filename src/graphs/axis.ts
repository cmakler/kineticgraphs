/// <reference path="../kg.ts" />

module KineticGraphs
{

    export interface IAxis
    {
        dim: string;
        domain: IRange;
        title: string;
        ticks: number;
    }

    // Axis attributes
    export interface IAxisScope extends ng.IScope
    {
        dim: string;
        min: () => number;
        max: () => number;
        title: string;
        ticks: () => number;
    }

    // The link function registers the axis with the parent graph
    export function Axis(): ng.IDirective {

        function link(scope: IAxisScope, element:JQuery, attributes, graph: IGraph) {

            var axis:IAxis = {
                dim: scope.dim,
                domain: {
                    min: scope.min() || 0,
                    max: scope.max() || 10
                },
                title: scope.title || scope.dim + ' axis',
                ticks: scope.ticks() || 5

            };

            graph.addAxis(axis);

        }


        return {
            link: link,
            restrict: 'E',
            require: '^graph',
            scope: {dim: '@', min: '&', max: '&', title: '@', ticks: '&'}
        }

    }

}

