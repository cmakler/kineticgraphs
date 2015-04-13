/**
 * Created by cmakler on 4/8/15.
 */

/// <reference path="../kg.ts"/>
/// <reference path="graphObject.ts"/>

module KineticGraphs
{
    export interface IPoint extends IGraphObject {
        coordinates: ICoordinates;
    }

    export interface IPointScope extends IGraphObjectScope {
        coordinates: () => ICoordinates;
    }

    export class Point implements IPoint
    {

        public coordinates;

        constructor(scope:IPointScope) {
            this.coordinates = scope.coordinates();
        }

        render = function(graph) {

            var cx:number = graph.x(this.coordinates.x),
                cy:number = graph.y(this.coordinates.y);

            graph.vis.append('circle').attr({cx: cx, cy: cy, r: 3});

            return graph;
        }
    }

    export function pointDirective(): ng.IDirective {
        return {
            restrict: 'E',
            require: '^graph',
            link: (scope: IPointScope, element:JQuery, attributes, graph: IGraphController) => {
                graph.addObject(new Point(scope));
            },
            scope: {coordinates: '&'}
        }
    }

}