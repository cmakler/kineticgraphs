/**
 * Created by cmakler on 4/8/15.
 */

/// <reference path="composite.ts"/>

module KineticGraphs
{

    export interface IPointDefinition {
        coordinates?: ICoordinates;
    }

    export interface IPoint extends IComposite {
        coordinates: ICoordinates;
        graph: IGraph;
        circle: D3.Selection;
    }

    export class Point extends Composite implements IPoint
    {

        public coordinates;
        public graph;
        public circle;

        constructor() {
            super();
            this.coordinates = {x: 0, y: 0};
        }

        update(pointDefinition) {

            var currentCoordinates = this.coordinates;

            function updateCoordinate(newCoordinates:ICoordinates, dim:string) {
                var coord = currentCoordinates[dim];
                if(newCoordinates && newCoordinates.hasOwnProperty(dim) && newCoordinates[dim] != coord) {
                    coord = newCoordinates[dim];
                }
                return coord;
            }

            this.coordinates = {
                x: updateCoordinate(pointDefinition.coordinates, 'x'),
                y: updateCoordinate(pointDefinition.coordinates, 'y')
            };

            return this;
        }

        render(graph) {

            this.graph = graph;

            graph.vis.selectAll('circle').remove();

            var pixelCoordinates:ICoordinates = {
                x: graph.xAxis.scale(this.coordinates.x),
                y: graph.yAxis.scale(this.coordinates.y)
            };

            this.circle = graph.vis.append('circle').attr({cx: pixelCoordinates.x, cy: pixelCoordinates.y, r: 3});

        }
    }



}