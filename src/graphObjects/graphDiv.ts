/// <reference path="../kg.ts"/>
/// <reference path="graphObjects.ts"/>

module KineticGraphs
{

    export interface IGraphDivDefinition extends IGraphObjectDefinition
    {

    }

    export interface IGraphDiv extends IGraphObject {

        // GraphDiv-specific attributes
        coordinates: ICoordinates; // pixel coordinates, not "real" coordinates
        dimensions: IDimensions;
        text: string;
        math: boolean;
        align: string;
        valign: string;
    }

    export class GraphDiv extends GraphObject implements IGraphDiv
    {

        // GraphDiv-specific attributes
        public coordinates;
        public dimensions;
        public text;
        public math;
        public align;
        public valign;

        constructor() {

            super();
            // establish defaults
            this.coordinates = {x: 0, y: 0};
            this.math = false;
            this.dimensions = {width: 100, height: 20};
            this.align = 'center';
            this.text = '';
        }

        render(graph) {

            var graphDiv = this,
                width = this.dimensions.width,
                height = this.dimensions.height;

            var el:D3.Selection = graph.getDiv(graphDiv.name);

            var style='text-align:center; color:gray; position:absolute; width: ' + width + 'px; height: ' + height + 'px; line-height: ' + height + 'px;';

            // Set left pixel margin
            var halfWidth = width * 0.5;
            // Default to centered on x coordinate
            var leftPixels = graphDiv.coordinates.x - halfWidth;
            if (graphDiv.align == 'left') {
                // move right by half the width of the div if left aligned
                leftPixels += halfWidth
            } else if (graphDiv.align == 'right') {
                // move left by half the width of the div if right aligned
                leftPixels -= halfWidth;
            }
            style += 'left: ' + leftPixels + 'px;';

            // Set top pixel margin
            var halfHeight = height * 0.5;
            // Default to centered on x coordinate
            var topPixels = graphDiv.coordinates.y - halfHeight;
            if (graphDiv.valign == 'top') {
                // move down by half the height of the div if top aligned
                topPixels += halfWidth
            } else if (graphDiv.align == 'right') {
                // move up by half the height of the div if right aligned
                topPixels -= halfWidth;
            }
            style += 'top: ' + topPixels + 'px;';

            //format the div
            el.attr('style',style);

            el.text(graphDiv.text);

            return graph;

        }
    }



}