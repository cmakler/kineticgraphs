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

        updateGraph:(graphDefinition: IGraphDefinition, redraw?: boolean) => IGraph;
        renderGraph:(element: JQuery, elementDimensions: IDimensions, margins: IMargins, xAxis: IAxis, yAxis: IAxis, redraw: boolean) => void;
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
            this.composites = [];
            this.updateGraph(graphDefinition);
        }

        updateGraph = function(graphDefinition, redraw?) {

            // Set redraw to true by default
            if(redraw == undefined) { redraw = true };

            // Rules for updating the dimensions fo the graph object, based on current graph element clientWidth
            function updateDimensions(clientWidth: number, dimensions?: IDimensions) {

                // Set default to the width of the enclosing element, with a height of 500
                var newDimensions: IDimensions = {width: clientWidth, height: 500};

                // If the author has specified a height, override
                if (dimensions && dimensions.hasOwnProperty('height')) {
                    newDimensions.height = dimensions.height;
                }

                // If the author has specified a width less than the graph element clientWidth, override
                if(dimensions && dimensions.hasOwnProperty('width') && dimensions.width < clientWidth) {
                    newDimensions.width = dimensions.width;
                }

                return newDimensions;
            }

            //
            if(graphDefinition) {

                var graph = this;

                // Establish dimensions of the graph
                var element = $('#' + graphDefinition.element_id)[0];
                var dimensions = updateDimensions(element.clientWidth, graphDefinition.dimensions);
                var margins = graphDefinition.margins || {top: 20, left: 100, bottom: 100, right: 20};

                // Update axis objects
                this.xAxis.update(graphDefinition.xAxis);
                this.yAxis.update(graphDefinition.yAxis);

                // Update composite objects
                if(graphDefinition.hasOwnProperty('composites') && graphDefinition.composites.length > 0) {
                    this.composites = graphDefinition.composites.map(function(compositeDefinition:ICompositeDefinition) {
                        var composite = new Composite(compositeDefinition.type);
                        return composite.instance(compositeDefinition.definition, graph)
                    })
                }

                // Render the graph
                this.renderGraph(element, dimensions, margins, this.xAxis, this.yAxis, redraw);

            }

            return this;

        };

        renderGraph = function(element,elementDimensions, margins, xAxis, yAxis, redraw) {

            if(element && redraw) {

                console.log('redrawing!')

                d3.select(element).select('svg').remove();
                d3.select(element).selectAll('div').remove();

                this.vis = d3.select(element)
                    .append("svg")
                    .attr("width", elementDimensions.width)
                    .attr("height", elementDimensions.height)
                    .append("g")
                    .attr("transform", "translate(" + margins.left + "," + margins.top + ")");

                // Establish dimensions of axes (element dimensions minus margins)
                var axisDimensions = {
                    width: elementDimensions.width - margins.left - margins.right,
                    height: elementDimensions.height - margins.top - margins.bottom
                };

                // draw axes
                xAxis.draw(this.vis,axisDimensions);
                yAxis.draw(this.vis,axisDimensions);

                // draw composites
                this.composites.forEach(function(composite) {composite.render({}, this.vis)})
            }

        };



    }

}

