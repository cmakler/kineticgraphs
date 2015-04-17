/**
 * Created by cmakler on 4/8/15.
 */

/// <reference path="composite.ts"/>

module KineticGraphs
{
    export interface IPoint extends IComposite {
        coordinates: ICoordinates;
    }

    export class Point implements IPoint
    {

        public coordinates;

        constructor() {

        }

        render = function(graph) {

            var coordinates = this.scope.coordinates();

            if(typeof coordinates.x == "number" && typeof coordinates.y == "number") {
                var cx:number = graph.x(coordinates.x),
                    cy:number = graph.y(coordinates.y);
                graph.vis.append('circle').attr({cx: cx, cy: cy, r: 3});
            }

            return graph;
        }
    }



}