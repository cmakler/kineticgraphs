/// <reference path="../kg.ts"/>
/// <reference path="interactive.ts" />


module KineticGraphs
{

    // Graph definition objects
    export interface IGraphDefinition extends IInteractiveDefinition
    {
        xAxis: IAxisDefinition;
        yAxis: IAxisDefinition;
        graphObjects?: IGraphObjectFactoryDefinition[];
    }

    // Additions to the scope of a graph
    export interface IGraph extends IInteractive
    {
        xAxis: IAxis;
        yAxis: IAxis;

        graphObjects: IGraphObjects;
        objectGroup: (name, init:((newGroup:D3.Selection) => D3.Selection)) => D3.Selection;

        updateParams:(any) => void;

        // methods for handling points outside the graph area
        xOnGraph: (x:number) => boolean;
        yOnGraph: (x:number) => boolean;
        onGraph: (coordinates:ICoordinates) => boolean;
        nearestGraphPoint: (onGraphPoint: ICoordinates, offGraphPoint: ICoordinates) => ICoordinates;
    }

    export class Graph extends Interactive implements IGraph
    {
        public xAxis;
        public yAxis;
        public graphObjects;

        constructor(public definitionString:string) {
            super(definitionString);
            this.xAxis = new XAxis();
            this.yAxis = new YAxis();
        }

        // Used to update parameters of the model from within the graph
        updateParams(params:any) {
            for (var key in params) {
                if (params.hasOwnProperty(key) && this.scope.params.hasOwnProperty(key)) {
                    this.scope.params[key] = params[key];
                }
            }
            this.scope.$apply();
        }

        objectGroup(name, init:((newGroup:D3.Selection) => D3.Selection)) {

            var group = this.vis.select('#' + name);

            // TODO need better way to check if it doesn't yet exist
            if(group[0][0] == null) {
                group = this.vis.append('g').attr('id',name);
                group = init(group)
            }

            return group;
        }

        xOnGraph(x:number) {
            return this.xAxis.domain.contains(x);
        }

        yOnGraph(y:number) {
            return this.yAxis.domain.contains(y);
        }

        // Check to see if a point is on the graph
        onGraph(coordinates:ICoordinates) {
            return (this.xOnGraph(coordinates.x) && this.yOnGraph(coordinates.y));
        }

        // This should be called with one point on the graph and another off
        nearestGraphPoint(onGraphPoint: ICoordinates, offGraphPoint: ICoordinates) {
            return onGraphPoint;
        }

        // Update graph based on latest parameters
        redraw() {

            var graph = this,
                definition = this.definition,
                updateDimensions = this.updateDimensions;

            // Redraw the graph if necessary
            console.log('redrawing!');

            // Establish dimensions of the graph
            var element = $('#' + definition.element_id)[0];
            var dimensions = updateDimensions(element.clientWidth, definition.dimensions);
            var margins = definition.margins || {top: 20, left: 100, bottom: 100, right: 20};

            // Update axis objects
            graph.xAxis.update(definition.xAxis);
            graph.yAxis.update(definition.yAxis);

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

            return graph;

        }

        drawObjects() {

            var graph = this,
                definition = this.definition;

            if(!graph.graphObjects || graph.graphObjects == undefined) {
                graph.graphObjects = new GraphObjects(definition.graphObjects);
            }

            // Update graphObject graph objects based on change in scope
            return graph.graphObjects.update(definition.graphObjects).render(graph);

        }

    }

}

