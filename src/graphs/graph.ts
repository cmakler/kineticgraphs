/// <reference path="../kg.ts"/>
/// <reference path="helpers.ts"/>
/// <reference path="axis.ts"/>
/// <reference path="composites/composite.ts"/>
/// <reference path="composites/point.ts"/>

module KineticGraphs
{

    // Graph definition objects
    export interface IGraphDefinition
    {
        element_id: string;
        dimensions?: IDimensions;
        margins?: IMargins;
        xAxis: IAxisDefinition;
        yAxis: IAxisDefinition;
        composites?: ICompositeDefinition[];
    }

    // Additions to the scope of a graph
    export interface IGraph
    {
        graphDefinition: IGraphDefinition;

        element: JQuery;
        vis: D3.Selection;

        xAxis: IAxis;
        yAxis: IAxis;

        composites: IComposite[];

        updateGraph:(graphDefinition: IGraphDefinition) => IGraph;
        renderGraph:(element: JQuery, elementDimensions: IDimensions, margins: IMargins, graphDimensions: IDimensions, xAxis: IAxis, yAxis: IAxis) => void;
    }

    export class Graph implements IGraph
    {
        public element;
        public vis;

        public xAxis;
        public yAxis;

        public composites;


        constructor(public graphDefinition?:IGraphDefinition) {
            this.xAxis = new XAxis();
            this.yAxis = new YAxis();
            this.updateGraph(graphDefinition);
        }

        updateGraph = function(graphDefinition) {

            // Calculate the dimensions of the graph element
            function calculateElementDimensions(clientWidth: number, dimensions?: IDimensions) {

                // Set default to the width of the enclosing div, with a height of 500
                var elementDimensions: IDimensions = {width: clientWidth, height: 500};

                if (dimensions) {

                    // Override with given attributes if they exist
                    if(dimensions.hasOwnProperty('height')) {
                        elementDimensions.height = dimensions.height;
                    }
                    if(dimensions.hasOwnProperty('width')) {
                        elementDimensions.width = Math.min(dimensions.width, elementDimensions.width);
                    }
                }

                return elementDimensions;
            }

            if(graphDefinition) {

                var element = $('#' + graphDefinition.element_id)[0];

                var elementDimensions = calculateElementDimensions(element.clientWidth, graphDefinition.dimensions);

                var margins = graphDefinition.margins || {top: 20, left: 100, bottom: 100, right: 20};

                // Establish inner dimensions of graph (element dimensions minus margins)
                var graphDimensions = {
                    width: elementDimensions.width - margins.left - margins.right,
                    height: elementDimensions.height - margins.top - margins.bottom
                };

                // Update axis objects
                this.xAxis.update(graphDefinition.xAxis);
                this.yAxis.update(graphDefinition.yAxis);

                this.renderGraph(element,elementDimensions, margins, graphDimensions, this.xAxis, this.yAxis);

                return this;

            }

        };

        renderGraph = function(element,elementDimensions, margins, graphDimensions, xAxis, yAxis) {

            if(element) {

                d3.select(element).select('svg').remove();
                d3.select(element).selectAll('div').remove();

                this.vis = d3.select(element)
                    .append("svg")
                    .attr("width", elementDimensions.width)
                    .attr("height", elementDimensions.height)
                    .append("g")
                    .attr("transform", "translate(" + margins.left + "," + margins.top + ")");

                // draw axes
                xAxis.draw(this.vis,graphDimensions);
                yAxis.draw(this.vis,graphDimensions);
            }

        };



    }

}

