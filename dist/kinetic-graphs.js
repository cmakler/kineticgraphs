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
    var Axes = (function () {
        function Axes(attributeString) {
            this.attributeString = attributeString;
            this.x = new XAxis();
            this.y = new YAxis();
        }
        Axes.prototype.update = function (scope) {
            var attrs = scope.$eval(this.attributeString);
            this.x.update(attrs['x']);
            this.y.update(attrs['y']);
        };
        Axes.prototype.draw = function (vis, graph_dimensions) {
            this.x.draw(vis, graph_dimensions);
            this.y.draw(vis, graph_dimensions);
        };
        return Axes;
    })();
    KineticGraphs.Axes = Axes;
})(KineticGraphs || (KineticGraphs = {}));
/// <reference path="../graph.ts"/>
/**
 * Created by cmakler on 4/8/15.
 */
/// <reference path="composite.ts"/>
var KineticGraphs;
(function (KineticGraphs) {
    var Point = (function () {
        function Point() {
            this.render = function (graph) {
                var coordinates = this.scope.coordinates();
                if (typeof coordinates.x == "number" && typeof coordinates.y == "number") {
                    var cx = graph.x(coordinates.x), cy = graph.y(coordinates.y);
                    graph.vis.append('circle').attr({ cx: cx, cy: cy, r: 3 });
                }
                return graph;
            };
        }
        return Point;
    })();
    KineticGraphs.Point = Point;
})(KineticGraphs || (KineticGraphs = {}));
/// <reference path="../kg.ts"/>
/// <reference path="helpers.ts"/>
/// <reference path="axes.ts"/>
/// <reference path="composites/composite.ts"/>
/// <reference path="composites/point.ts"/>
var KineticGraphs;
(function (KineticGraphs) {
    var Graph = (function () {
        function Graph(element) {
            this.element = element;
            this.renderGraph = function (scope) {
                // Get attributes of <graph> element
                var element = this.element[0], attributes = element.attributes;
                // Establish default dimensions of graph
                var elementDimensions = { width: element.parentElement.clientWidth, height: 500 }, margin = { top: 20, left: 100, bottom: 100, right: 20 };
                // Override with given attributes if they exist
                if (attributes.hasOwnProperty('height')) {
                    elementDimensions.height = +attributes['height'].value;
                }
                if (attributes.hasOwnProperty('width')) {
                    elementDimensions.width = Math.min(attributes['width'].value, elementDimensions.width);
                }
                // Establish inner dimensions of graph (element dimensions minus margins)
                var graphDimensions = {
                    width: elementDimensions.width - margin.left - margin.right,
                    height: elementDimensions.height - margin.top - margin.bottom
                };
                if (this.vis) {
                    d3.select(element).select('svg').remove();
                    d3.select(element).selectAll('div').remove();
                }
                this.vis = d3.select(element).append("svg").attr("width", elementDimensions.width).attr("height", elementDimensions.height).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                this.axes.update(scope);
                this.axes.draw(this.vis, graphDimensions);
                this.updateGraph(scope);
            };
            this.updateGraph = function (scope) {
            };
            this.axes = new KineticGraphs.Axes(element.attr('axes'));
            this.composites = [];
        }
        return Graph;
    })();
    KineticGraphs.Graph = Graph;
    // Creation of graph from element and children
    function graphDirective() {
        return {
            restrict: 'E',
            link: function (scope, element) {
                scope.graphs.push(new Graph(element));
            }
        };
    }
    KineticGraphs.graphDirective = graphDirective;
})(KineticGraphs || (KineticGraphs = {}));
/// <reference path="../kg.ts" />
var KineticGraphs;
(function (KineticGraphs) {
    var ModelController = (function () {
        function ModelController($scope) {
            this.$scope = $scope;
            $scope.params = {};
            $scope.graphs = [];
            $scope.render = function () {
                $scope.graphs.forEach(function (graph) {
                    graph.renderGraph($scope);
                });
            };
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
angular.module('KineticGraphs', []).controller('KineticGraphCtrl', KineticGraphs.ModelController).directive('graph', KineticGraphs.graphDirective);
//# sourceMappingURL=kinetic-graphs.js.map