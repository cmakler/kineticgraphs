/**
 * Created by cmakler on 4/7/15.
 */
var KineticGraphs;
(function (KineticGraphs) {
    var Domain = (function () {
        function Domain(min, max) {
            this.min = min;
            this.max = max;
            this.min = this.min || 0;
            this.max = this.max || 10;
        }
        Domain.prototype.toArray = function () {
            return [this.min, this.max];
        };
        return Domain;
    })();
    KineticGraphs.Domain = Domain;
})(KineticGraphs || (KineticGraphs = {}));
/// <reference path="graph.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var KineticGraphs;
(function (KineticGraphs) {
    var Axis = (function () {
        function Axis(axisDefinition) {
            if (axisDefinition) {
                this.update(axisDefinition);
            }
        }
        Axis.prototype.update = function (axisDefinition) {
            if (this.domain) {
                if (axisDefinition.min) {
                    this.domain.min = axisDefinition.min;
                }
                if (axisDefinition.max) {
                    this.domain.max = axisDefinition.max;
                }
            }
            else {
                this.domain = new KineticGraphs.Domain(axisDefinition.min, axisDefinition.max);
            }
            this.title = axisDefinition.title || '';
            this.ticks = axisDefinition.ticks || 5;
            return this;
        };
        Axis.prototype.draw = function (vis, graph_definition) {
            // overridden by child class
        };
        Axis.prototype.scaleFunction = function (pixelLength, domain) {
            return d3.scale.linear(); // overridden by child class
        };
        return Axis;
    })();
    KineticGraphs.Axis = Axis;
    var XAxis = (function (_super) {
        __extends(XAxis, _super);
        function XAxis() {
            _super.apply(this, arguments);
        }
        XAxis.prototype.scaleFunction = function (pixelLength, domain) {
            return d3.scale.linear().range([0, pixelLength]).domain(domain.toArray());
        };
        XAxis.prototype.draw = function (vis, graph_dimensions) {
            this.scale = this.scaleFunction(graph_dimensions.width, this.domain);
            var axis_vis = vis.append('g').attr('class', 'x axis').attr("transform", "translate(0," + graph_dimensions.height + ")");
            axis_vis.append("text").attr("x", graph_dimensions.width / 2).attr("y", "4em").style("text-anchor", "middle").text(this.title);
            axis_vis.call(d3.svg.axis().scale(this.scale).orient("bottom").ticks(this.ticks));
        };
        return XAxis;
    })(Axis);
    KineticGraphs.XAxis = XAxis;
    var YAxis = (function (_super) {
        __extends(YAxis, _super);
        function YAxis() {
            _super.apply(this, arguments);
        }
        YAxis.prototype.scaleFunction = function (pixelLength, domain) {
            return d3.scale.linear().range([pixelLength, 0]).domain(domain.toArray());
        };
        YAxis.prototype.draw = function (vis, graph_dimensions) {
            this.scale = this.scaleFunction(graph_dimensions.height, this.domain);
            var axis_vis = vis.append('g').attr('class', 'y axis');
            axis_vis.append("text").attr("transform", "rotate(-90)").attr("x", -graph_dimensions.height / 2).attr("y", "-4em").style("text-anchor", "middle").text(this.title);
            axis_vis.call(d3.svg.axis().scale(this.scale).orient("left").ticks(this.ticks));
        };
        return YAxis;
    })(Axis);
    KineticGraphs.YAxis = YAxis;
})(KineticGraphs || (KineticGraphs = {}));
/// <reference path="../graph.ts"/>
var KineticGraphs;
(function (KineticGraphs) {
    var GraphObject = (function () {
        function GraphObject() {
        }
        // Common functionality for all
        GraphObject.prototype.updateGenerics = function (definition) {
            if (!definition.name) {
                console.log('error: a name is required of all objects!');
            }
            this.className = (definition.hasOwnProperty('className')) ? definition.className : '';
            this.show = (definition.hasOwnProperty('show')) ? definition.show : true;
            this.name = definition.name;
        };
        GraphObject.prototype.update = function (definition) {
            return this; // overridden by child class
        };
        GraphObject.prototype.render = function (graph) {
            return graph; // overridden by child class
        };
        return GraphObject;
    })();
    KineticGraphs.GraphObject = GraphObject;
    var GraphObjects = (function () {
        function GraphObjects(definitions) {
            this.reset(definitions);
        }
        GraphObjects.prototype.reset = function (definitions) {
            this.data = definitions.map(function (definition) {
                return new KineticGraphs[definition.type];
            });
        };
        // Updates all graphObjects based on an array of definitions, and returns updated GraphObjects object
        GraphObjects.prototype.update = function (definitions) {
            this.data.forEach(function (graphObject, index) {
                graphObject.update(definitions[index].definition);
            });
            return this;
        };
        GraphObjects.prototype.render = function (graph) {
            this.data.forEach(function (graphObject) {
                graph = graphObject.render(graph);
            });
            return graph;
        };
        return GraphObjects;
    })();
    KineticGraphs.GraphObjects = GraphObjects;
})(KineticGraphs || (KineticGraphs = {}));
/**
 * Created by cmakler on 4/8/15.
 */
var KineticGraphs;
(function (KineticGraphs) {
    var Point = (function (_super) {
        __extends(Point, _super);
        function Point() {
            _super.call(this);
            this.coordinates = { x: 0, y: 0 };
        }
        Point.prototype.update = function (pointDefinition) {
            var currentCoordinates = this.coordinates;
            function updateCoordinate(newCoordinates, dim) {
                var coord = currentCoordinates[dim];
                if (newCoordinates && newCoordinates.hasOwnProperty(dim) && newCoordinates[dim] != coord) {
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
        };
        Point.prototype.render = function (graph) {
            var className = this.className + (this.show ? ' visible' : ' invisible');
            var group = graph.vis.select('#' + this.name);
            if (group[0][0] == null) {
                group = graph.vis.append('g').attr('id', this.name);
                group.append('circle');
            }
            var circle = group.select('circle').attr('class', className);
            var pixelCoordinates = {
                x: graph.xAxis.scale(this.coordinates.x),
                y: graph.yAxis.scale(this.coordinates.y)
            };
            circle.attr({ cx: pixelCoordinates.x, cy: pixelCoordinates.y, r: 10 });
            return graph;
        };
        return Point;
    })(KineticGraphs.GraphObject);
    KineticGraphs.Point = Point;
})(KineticGraphs || (KineticGraphs = {}));
/// <reference path="../kg.ts"/>
/// <reference path="helpers.ts"/>
/// <reference path="axis.ts"/>
/// <reference path="graphObjects/graphObjects.ts"/>
/// <reference path="graphObjects/point.ts"/>
var KineticGraphs;
(function (KineticGraphs) {
    var Graph = (function () {
        function Graph(scope, graphDefinition) {
            this.scope = scope;
            this.graphDefinition = graphDefinition;
            // Used to update parameters of the model from within the graph
            this.updateParams = function (params) {
                for (var key in params) {
                    if (params.hasOwnProperty(key) && this.scope.params.hasOwnProperty(key)) {
                        this.scope.params[key] = params[key];
                    }
                }
            };
            // Update graph based on latest parameters
            this.updateGraph = function (graphDefinition, scope, redraw) {
                if (!graphDefinition) {
                    console.log('updateGraph called without graphDefinition!');
                    return;
                }
                this.scope = scope;
                var graph = this;
                // Set redraw to true by default
                if (redraw == undefined) {
                    redraw = true;
                }
                // Rules for updating the dimensions fo the graph object, based on current graph element clientWidth
                function updateDimensions(clientWidth, dimensions) {
                    // Set default to the width of the enclosing element, with a height of 500
                    var newDimensions = { width: clientWidth, height: 500 };
                    // If the author has specified a height, override
                    if (dimensions && dimensions.hasOwnProperty('height')) {
                        newDimensions.height = dimensions.height;
                    }
                    // If the author has specified a width less than the graph element clientWidth, override
                    if (dimensions && dimensions.hasOwnProperty('width') && dimensions.width < clientWidth) {
                        newDimensions.width = dimensions.width;
                    }
                    return newDimensions;
                }
                // Redraw the graph if necessary
                if (redraw) {
                    console.log('redrawing!');
                    // Establish dimensions of the graph
                    var element = $('#' + graphDefinition.element_id)[0];
                    var dimensions = updateDimensions(element.clientWidth, graphDefinition.dimensions);
                    var margins = graphDefinition.margins || { top: 20, left: 100, bottom: 100, right: 20 };
                    // Update axis objects
                    graph.xAxis.update(graphDefinition.xAxis);
                    graph.yAxis.update(graphDefinition.yAxis);
                    // Remove existing graph
                    d3.select(element).select('svg').remove();
                    d3.select(element).selectAll('div').remove();
                    // Create new SVG element for the graph visualization
                    graph.vis = d3.select(element).append("svg").attr("width", dimensions.width).attr("height", dimensions.height).append("g").attr("transform", "translate(" + margins.left + "," + margins.top + ")");
                    // Establish dimensions of axes (element dimensions minus margins)
                    var axisDimensions = {
                        width: dimensions.width - margins.left - margins.right,
                        height: dimensions.height - margins.top - margins.bottom
                    };
                    // draw axes
                    graph.xAxis.draw(graph.vis, axisDimensions);
                    graph.yAxis.draw(graph.vis, axisDimensions);
                }
                if (!graph.graphObjects || graph.graphObjects == undefined) {
                    graph.graphObjects = new KineticGraphs.GraphObjects(graphDefinition.graphObjects);
                }
                // Update graphObject graph objects based on change in scope
                return graph.graphObjects.update(graphDefinition.graphObjects).render(graph);
            };
            this.xAxis = new KineticGraphs.XAxis();
            this.yAxis = new KineticGraphs.YAxis();
            if (graphDefinition) {
                this.graphObjects = new KineticGraphs.GraphObjects(graphDefinition.graphObjects);
                this.updateGraph(graphDefinition, scope, true);
            }
        }
        return Graph;
    })();
    KineticGraphs.Graph = Graph;
})(KineticGraphs || (KineticGraphs = {}));
/// <reference path="../kg.ts" />
var KineticGraphs;
(function (KineticGraphs) {
    var ModelController = (function () {
        function ModelController($scope, $window) {
            this.$scope = $scope;
            $scope.graphDefinitions = ["{element_id:'graph', dimensions: {width: 700, height: 700}, xAxis: {min: 0, max: 20, title: graphParams.xAxisLabel},yAxis: {min: 0, max: 10, title: 'Y axis'}, graphObjects:[{type: 'Point', definition: {show: params.show, className: 'equilibrium', name: 'eqm', coordinates: {x: params.x, y: params.y}}}]}"];
            $scope.params = { x: 20, y: 4, show: true };
            $scope.graphParams = { xAxisLabel: 'Quantity' };
            // Creates an object based on string using current scope parameter values
            function currentValue(s) {
                return $scope.$eval(s);
            }
            // Creates graph objects from (string) graph definitions
            function createGraphs() {
                var graphs = [];
                if ($scope.graphDefinitions) {
                    $scope.graphDefinitions.forEach(function (graphDefinition) {
                        graphs.push(new KineticGraphs.Graph($scope, currentValue(graphDefinition)));
                    });
                }
                return graphs;
            }
            // Updates and redraws graphs when a parameter changes
            function updateGraphs(redraw) {
                // Create graph objects if they don't already exist
                $scope.graphs = $scope.graphs || createGraphs();
                // Update each graph (updating triggers the graph to redraw its objects and possibly itself)
                $scope.graphs = $scope.graphs.map(function (graph, index) {
                    return graph.updateGraph(currentValue($scope.graphDefinitions[index]), $scope, redraw);
                });
            }
            // Erase and redraw all graphs; do this when graph parameters change, or the window is resized
            function redrawGraphs() {
                updateGraphs(true);
            }
            $scope.$watchCollection('graphParams', redrawGraphs);
            angular.element($window).on('resize', redrawGraphs);
            // Update objects on graphs (not the axes or graphs themselves); to this when model parameters change
            function redrawObjects() {
                updateGraphs(false);
            }
            $scope.$watchCollection('params', redrawObjects);
        }
        return ModelController;
    })();
    KineticGraphs.ModelController = ModelController;
})(KineticGraphs || (KineticGraphs = {}));
/// <reference path="../bower_components/DefinitelyTyped/jquery/jquery.d.ts" />
/// <reference path="../bower_components/DefinitelyTyped/angularjs/angular.d.ts"/>
/// <reference path="../bower_components/DefinitelyTyped/d3/d3.d.ts"/>
/// <reference path="graphs/graph.ts" />
/// <reference path="model/model.ts" />
angular.module('KineticGraphs', []).controller('KineticGraphCtrl', KineticGraphs.ModelController);
//# sourceMappingURL=kinetic-graphs.js.map