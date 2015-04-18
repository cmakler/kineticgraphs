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
        graph: IGraph
        circle: D3.Selection;
    }

    export class Point implements IPoint
    {

        public coordinates;
        public circle;

        constructor(definition:IPointDefinition, public graph: IGraph) {
            this.coordinates = definition.coordinates || {x: 0, y: 0};
        }

        render = function(pointDefinition:IPointDefinition) {

            console.log('rendering point')

            if(!this.graph.vis) {
                return;
            }

            if(!this.circle) {
                this.circle = this.graph.vis.append('circle');
            }

            var currentCoordinates = this.coordinates || {x: 0, y: 0};
            var pixelCoordinates:ICoordinates;

            function updateCoordinate(newCoordinates:ICoordinates, dim:string) {
                var coord = currentCoordinates[dim];
                if(newCoordinates && newCoordinates.hasOwnProperty(dim) && typeof newCoordinates[dim] == "number" && newCoordinates[dim] != coord) {
                    coord = newCoordinates[dim];
                }
                return coord;
            }

            currentCoordinates = {
                x: updateCoordinate(pointDefinition.coordinates, 'x'),
                y: updateCoordinate(pointDefinition.coordinates, 'y')
            };

            console.log('drawing point (',currentCoordinates.x,',',currentCoordinates.y,')');

            pixelCoordinates = {
                x: this.graph.xAxis.scale(currentCoordinates.x),
                y: this.graph.yAxis.scale(currentCoordinates.y)
            };

            this.coordinates = currentCoordinates;
            this.circle.attr({cx: pixelCoordinates.x, cy: pixelCoordinates.y, r: 3});

        }
    }



}