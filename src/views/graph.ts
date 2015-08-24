/// <reference path="../kg.ts"/>

'use strict';

module KG
{

    // Graph definition objects
    export interface GraphDefinition extends ViewDefinition
    {
        xAxis: AxisDefinition;
        yAxis: AxisDefinition;
    }

    // Additions to the scope of a graph
    export interface IGraph extends IView
    {
        // methods for handling points outside the graph area
        onGraph: (coordinates:ICoordinates) => boolean;

        // methods for converting model coordiantes to pixel coordinates
        pixelCoordinates: (coordinates:ICoordinates) => ICoordinates;
        modelCoordinates: (coordinates:ICoordinates) => ICoordinates;
        dataCoordinates: (coordinateArray:ICoordinates[]) => ICoordinates[];
    }

    export class Graph extends View implements IGraph
    {
        constructor(definition:GraphDefinition) {

            // ensure dimensions and margins are set; set any missing elements to defaults
            definition.maxDimensions = _.defaults(definition.maxDimensions || {}, { width: 800, height: 800 });
            definition.margins = _.defaults(definition.margins || {}, {top: 20, left: 80, bottom: 70, right: 20});
            super(definition);

            this.xAxis = new XAxis(definition.xAxis);
            this.yAxis = new YAxis(definition.yAxis);
        }

        // Check to see if a point is on the graph
        onGraph(coordinates:ICoordinates) {
            return (this.xOnGraph(coordinates.x) && this.yOnGraph(coordinates.y));
        }

        // Convert model coordinates to pixel coordinates for a single point
        pixelCoordinates(coordinates:ICoordinates) {
            coordinates.x = this.xAxis.scale(coordinates.x);
            coordinates.y = this.yAxis.scale(coordinates.y);
            return coordinates;
        }

        // Convert pixel coordinates to model coordinates for a single point
        modelCoordinates(coordinates:ICoordinates) {
            coordinates.x = this.xAxis.scale.invert(coordinates.x);
            coordinates.y = this.yAxis.scale.invert(coordinates.y);
            return coordinates;
        }

        // Transform pixel coordinates
        translateByCoordinates(coordinates:ICoordinates) {
            return KG.translateByPixelCoordinates(this.pixelCoordinates(coordinates));
        }

        positionByCoordinates(coordinates:ICoordinates, dimension?:IDimensions) {
            return KG.positionByPixelCoordinates(this.pixelCoordinates(coordinates), dimension);
        }

        // Convert model coordinates to pixel coordinates for an array of points
        dataCoordinates(coordinateArray:ICoordinates[]) {
            var graph = this;
            return coordinateArray.map(graph.pixelCoordinates, graph);
        }

    }

}

