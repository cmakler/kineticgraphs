/**
 * Created by cmakler on 4/8/15.
 */

module KineticGraphs
{

    export interface IPointDefinition extends IGraphObjectDefinition {
        coordinates?: ICoordinates;
    }

    export interface IPoint extends IGraphObject {
        coordinates: ICoordinates;
    }

    export class Point extends GraphObject implements IPoint
    {

        public coordinates;
        public show;
        public name;
        public className;

        constructor() {
            super();
            this.coordinates = {x: 0, y: 0};
        }

        update(pointDefinition:IPointDefinition) {

            var currentCoordinates = this.coordinates;

            function updateCoordinate(newCoordinates:ICoordinates, dim:string) {
                var coord = currentCoordinates[dim];
                if(newCoordinates && newCoordinates.hasOwnProperty(dim) && newCoordinates[dim] != coord) {
                    coord = newCoordinates[dim];
                }
                return coord;
            }

            this.updateGenerics(pointDefinition);

            this.coordinates = {
                x: updateCoordinate(pointDefinition.coordinates, 'x'),
                y: updateCoordinate(pointDefinition.coordinates, 'y')
            };

            return this;
        }

        render(graph) {

            var className = this.className + (this.show ? ' visible' : ' invisible');

            var group = graph.vis.select('#' + this.name);

            if(group[0][0] == null) {
                group = graph.vis.append('g').attr('id',this.name);
                group.append('circle')
            }

            var circle = group.select('circle').attr('class',className);

            var pixelCoordinates:ICoordinates = {
                x: graph.xAxis.scale(this.coordinates.x),
                y: graph.yAxis.scale(this.coordinates.y)
            };

            circle.attr({cx: pixelCoordinates.x, cy: pixelCoordinates.y, r: 10});

            return graph;

        }
    }



}