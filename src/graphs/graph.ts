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
        elementDimensions: IDimensions;
        graphDimensions: IDimensions;
        margins: IMargins;
        vis: D3.Selection;

        xAxis: IAxisDefinition;
        yAxis: IAxisDefinition;

        composites: IComposite[];

        updateGraph:(graphDefinition: IGraphDefinition) => void;
        renderGraph:(scope:IModelScope) => void;
    }

    export class Graph implements IGraph
    {
        public element;
        public elementDimensions;
        public graphDimensions;
        public margins;
        public vis;

        public xAxis;
        public yAxis;

        public composites;


        constructor(public graphDefinition:IGraphDefinition) {
            this.element = $('#' + graphDefinition.element_id)[0];
            this.xAxis = new XAxis();
            this.yAxis = new YAxis();
            this.updateGraph(graphDefinition);
        }

        updateGraph = function(graphDefinition) {

            var elementDimensions: IDimensions = {width: this.element.clientWidth, height: 500};

            if (graphDefinition.hasOwnProperty('dimensions')) {

                var dim = graphDefinition.dimensions;
                // Override with given attributes if they exist
                if(dim.hasOwnProperty('height')) {
                    elementDimensions.height = dim.height;
                }
                if(dim.hasOwnProperty('width')) {
                    elementDimensions.width = Math.min(dim.width, elementDimensions.width);
                }
            }

            this.margins = graphDefinition.margins || {top: 20, left: 100, bottom: 100, right: 20};

            this.elementDimensions = elementDimensions;

            // Establish inner dimensions of graph (element dimensions minus margins)
            this.graphDimensions = {
                width: this.elementDimensions.width - this.margins.left - this.margins.right,
                height: this.elementDimensions.height - this.margins.top - this.margins.bottom
            };

            // Update axis objects
            this.xAxis.update(graphDefinition.xAxis);
            this.yAxis.update(graphDefinition.yAxis);

            this.renderGraph();

        };

        renderGraph = function() {

            var element = this.element;

            if (this.vis) {
                d3.select(element).select('svg').remove();
                d3.select(element).selectAll('div').remove();
            }

            this.vis = d3.select(element)
                .append("svg")
                .attr("width", this.elementDimensions.width)
                .attr("height", this.elementDimensions.height)
                .append("g")
                .attr("transform", "translate(" + this.margins.left + "," + this.margins.top + ")");

            // draw axes
            this.xAxis.draw(this.vis,this.graphDimensions);
            this.yAxis.draw(this.vis,this.graphDimensions);

        };



    }

}

