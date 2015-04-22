/// <reference path="../kg.ts"/>
/// <reference path="helpers.ts"/>
/// <reference path="axis.ts"/>
/// <reference path="graphObjects/graphObjects.ts"/>
/// <reference path="graphObjects/point.ts"/>

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
        graphObjects?: IGraphObjectFactoryDefinition[];
    }

    // Additions to the scope of a graph
    export interface IGraph
    {
        scope: IModelScope;
        graphDefinition: IGraphDefinition;

        element: JQuery;
        vis: D3.Selection;

        xAxis: IAxis;
        yAxis: IAxis;

        graphObjects: IGraphObjects;

        updateGraph:(graphDefinition: IGraphDefinition, scope:IModelScope, redraw?: boolean) => IGraph;
        updateParams:(any) => void;

    }

    export class Graph implements IGraph
    {
        public element;
        public vis;

        public xAxis;
        public yAxis;

        public graphObjects;

        constructor(public scope:IModelScope, public graphDefinition:IGraphDefinition) {
            this.xAxis = new XAxis();
            this.yAxis = new YAxis();
            if(graphDefinition){
                this.graphObjects = new GraphObjects(graphDefinition.graphObjects);
                this.updateGraph(graphDefinition, scope, true);
            }
        }

        // Used to update parameters of the model from within the graph
        updateParams = function(params:any) {
            for (var key in params) {
                if (params.hasOwnProperty(key) && this.scope.params.hasOwnProperty(key)) {
                    this.scope.params[key] = params[key];
                }
            }
        };

        // Update graph based on latest parameters
        updateGraph = function(graphDefinition, scope, redraw?) {

            if(!graphDefinition) {
                console.log('updateGraph called without graphDefinition!');
                return;
            }

            this.scope = scope;
            var graph = this;

            // Set redraw to true by default
            if(redraw == undefined) { redraw = true }

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

            // Redraw the graph if necessary
            if(redraw) {

                console.log('redrawing!');

                // Establish dimensions of the graph
                var element = $('#' + graphDefinition.element_id)[0];
                var dimensions = updateDimensions(element.clientWidth, graphDefinition.dimensions);
                var margins = graphDefinition.margins || {top: 20, left: 100, bottom: 100, right: 20};

                // Update axis objects
                graph.xAxis.update(graphDefinition.xAxis);
                graph.yAxis.update(graphDefinition.yAxis);

                // Remove existing graph
                d3.select(element).select('svg').remove();
                d3.select(element).selectAll('div').remove();

                // Create new SVG element for the graph visualization
                graph.vis = d3.select(element)
                    .append("svg")
                    .attr("width", dimensions.width)
                    .attr("height", dimensions.height)
                    .append("g")
                    .attr("transform", "translate(" + margins.left + "," + margins.top + ")");

                // Establish dimensions of axes (element dimensions minus margins)
                var axisDimensions = {
                    width: dimensions.width - margins.left - margins.right,
                    height: dimensions.height - margins.top - margins.bottom
                };

                // draw axes
                graph.xAxis.draw(graph.vis,axisDimensions);
                graph.yAxis.draw(graph.vis,axisDimensions);

            }

            if(!graph.graphObjects || graph.graphObjects == undefined) {
                graph.graphObjects = new GraphObjects(graphDefinition.graphObjects);
            }

            // Update graphObject graph objects based on change in scope
            return graph.graphObjects.update(graphDefinition.graphObjects).render(graph);

        };

    }

}

