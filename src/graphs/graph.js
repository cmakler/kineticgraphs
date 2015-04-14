/// <reference path="../kg.ts"/>
/// <reference path="helpers.ts"/>
/// <reference path="axis.ts"/>
var KineticGraphs;
(function (KineticGraphs) {
    // Implementation of graph methods
    var Graph = (function () {
        function Graph(element) {
            this.element = element;
            // define axis elements for the graph
            // and create the D3 scales for the x and y dimensions
            this.addAxis = function (axis) {
                var name = axis.dim === 'x' ? 'xAxis' : 'yAxis';
                this.$scope[name] = axis;
                this.$scope.drawGraph();
            };
            // define composites
            this.addComposite = function (composite) {
                this.$scope.composites.push(composite);
            };
            // define primitives
            this.addPrimitive = function (primitive) {
                this.$scope.primitives.push(primitive);
            };
            // draw the graph defined in the $scope
            this.drawGraph = function () {
                var graph = this;
                if (graph.xAxis && graph.yAxis && graph.element) {
                    // Remove existing graph if already drawn
                    if (graph.vis) {
                        d3.select(graph.element).select('svg').remove();
                        d3.select(graph.element).selectAll('div').remove();
                    }
                    // Get attributes of <graph> element
                    var element = graph.element, attributes = element.attributes;
                    // Establish default dimensions of graph
                    var elementDimensions = { width: element.parentElement.clientWidth, height: 500 }, margin = { top: 20, left: 100, bottom: 100, right: 20 };
                    // Override with given attributes if they exist
                    if (attributes.hasOwnProperty('height')) {
                        elementDimensions.height = +attributes['height'].value;
                    }
                    if (attributes.hasOwnProperty('width')) {
                        elementDimensions.width = Math.min(+attributes['width'].value, elementDimensions.width);
                    }
                    // Establish inner dimensions of graph (element dimensions minus margins)
                    var graphDimensions = {
                        width: elementDimensions.width - margin.left - margin.right,
                        height: elementDimensions.height - margin.top - margin.bottom
                    };
                    // Create D3 SVG
                    graph.vis = d3.select(graph.element).append("svg").attr("width", elementDimensions.width).attr("height", elementDimensions.height).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                    // Establish scales
                    var xDomain = graph.xAxis.domain, yDomain = graph.yAxis.domain;
                    graph.x = d3.scale.linear().range([0, graphDimensions.width]).domain([xDomain.min, xDomain.max]);
                    graph.y = d3.scale.linear().range([graphDimensions.height, 0]).domain([yDomain.min, yDomain.max]);
                    var x_axis = graph.vis.append('g').attr('class', 'x axis').attr("transform", "translate(0," + graphDimensions.height + ")");
                    var y_axis = graph.vis.append('g').attr('class', 'y axis');
                    var x_axis_label = x_axis.append("text").attr("x", graphDimensions.width / 2).attr("y", "4em").style("text-anchor", "middle");
                    var y_axis_label = y_axis.append("text").attr("transform", "rotate(-90)").attr("x", -graphDimensions.height / 2).attr("y", "-4em").style("text-anchor", "middle");
                    // Add x axis
                    x_axis.call(d3.svg.axis().scale(graph.x).orient("bottom").ticks(graph.xAxis.ticks));
                    x_axis_label.text(graph.xAxis.title);
                    // Add y axis
                    y_axis.call(d3.svg.axis().scale(graph.y).orient("left").ticks(graph.yAxis.ticks));
                    y_axis_label.text(graph.yAxis.title);
                    this.renderPrimitives();
                }
            };
        }
        return Graph;
    })();
    KineticGraphs.Graph = Graph;
    // Creation of graph from element and children
    function graphDirective() {
        function link(scope, element, model) {
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
        };
    }
    KineticGraphs.graphDirective = graphDirective;
})(KineticGraphs || (KineticGraphs = {}));
//# sourceMappingURL=graph.js.map