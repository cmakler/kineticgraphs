/// <reference path="../kg.ts"/>
/// <reference path="helpers.ts"/>
/// <reference path="axis.ts"/>


module KineticGraphs
{

    // Attributes that may be set on the graph element
    export interface IGraphScope extends ng.IScope
    {
        width: number;
        height: number;
        graph: IGraph;
    }

    // Attributes and methods of the graph object
    export interface IGraph
    {

        // Dimensions of the graph
        element: JQuery;

        // Axis information
        xAxis: IAxis;
        yAxis: IAxis;

        // D3 Objects
        vis: D3.Selection;
        composites: IComposite[];
        primitives: IPrimitive[];

        // D3 Scales
        x: D3.Scale.LinearScale;
        y: D3.Scale.LinearScale;

        // External API
        addComposite: (composite: IComposite) => void;
        addPrimitive: (primitive: IPrimitive) => void;
        addAxis: (axis: IAxis) => void;
        drawGraph: () => void;
    }

    // Implementation of graph methods
    export class Graph implements IGraph
    {

        public xAxis;
        public yAxis;
        public vis;
        public composites;
        public primitives;
        public x;
        public y;

        constructor(public element:JQuery) {}

        // define axis elements for the graph
        // and create the D3 scales for the x and y dimensions
        addAxis = function(axis:IAxis) {
            var name:string = axis.dim === 'x' ? 'xAxis' : 'yAxis';
            this.$scope[name] = axis;
            this.$scope.drawGraph();
        };

        // define composites
        addComposite = function(composite) {
            this.$scope.composites.push(composite);
        };

        // define primitives
        addPrimitive = function(primitive) {
            this.$scope.primitives.push(primitive);
        };

        // draw the graph defined in the $scope
        drawGraph = function() {

            var graph = this;

            if (graph.xAxis && graph.yAxis && graph.element) {

                // Remove existing graph if already drawn
                if (graph.vis) {
                    d3.select(graph.element).select('svg').remove();
                    d3.select(graph.element).selectAll('div').remove();
                }

                // Get attributes of <graph> element
                var element = graph.element,
                    attributes:NamedNodeMap = element.attributes;

                // Establish default dimensions of graph
                var elementDimensions:IDimensions = {width: element.parentElement.clientWidth, height: 500},
                    margin:IMargins = {top: 20, left: 100, bottom: 100, right: 20};

                // Override with given attributes if they exist
                if (attributes.hasOwnProperty('height')) {
                    elementDimensions.height = +attributes['height'].value;
                }
                if (attributes.hasOwnProperty('width')) {
                    elementDimensions.width = Math.min(+attributes['width'].value, elementDimensions.width);
                }

                // Establish inner dimensions of graph (element dimensions minus margins)
                var graphDimensions:IDimensions = {
                    width: elementDimensions.width - margin.left - margin.right,
                    height: elementDimensions.height - margin.top - margin.bottom
                };

                // Create D3 SVG
                graph.vis = d3.select(graph.element)
                    .append("svg")
                    .attr("width", elementDimensions.width)
                    .attr("height", elementDimensions.height)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                // Establish scales

                var xDomain:IRange = graph.xAxis.domain,
                    yDomain:IRange = graph.yAxis.domain;

                graph.x = d3.scale.linear()
                    .range([0, graphDimensions.width])
                    .domain([xDomain.min, xDomain.max]);

                graph.y = d3.scale.linear()
                    .range([graphDimensions.height, 0])
                    .domain([yDomain.min, yDomain.max]);

                var x_axis = graph.vis.append('g').attr('class', 'x axis').attr("transform", "translate(0," + graphDimensions.height + ")");
                var y_axis = graph.vis.append('g').attr('class', 'y axis');

                var x_axis_label = x_axis.append("text")
                    .attr("x", graphDimensions.width / 2)
                    .attr("y", "4em")
                    .style("text-anchor", "middle");

                var y_axis_label = y_axis.append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("x", -graphDimensions.height / 2)
                    .attr("y", "-4em")
                    .style("text-anchor", "middle");

                // Add x axis
                x_axis.call(d3.svg.axis().scale(graph.x).orient("bottom").ticks(graph.xAxis.ticks));
                x_axis_label.text(graph.xAxis.title);

                // Add y axis
                y_axis.call(d3.svg.axis().scale(graph.y).orient("left").ticks(graph.yAxis.ticks));
                y_axis_label.text(graph.yAxis.title);

                this.renderPrimitives();

            }

        }

    }

    // Creation of graph from element and children
    export function graphDirective(): ng.IDirective {

        function link(scope: IGraphScope, element:JQuery, model: IModelController) {
            scope.graph = new Graph(element);
            model.addGraph(scope.graph);
        }

        return {
            restrict: 'E',
            transclude: true,
            require: "^model",
            template: "<div><div ng-transclude/></div>",
            link: link,
            controller: Graph
        }
    }

}

