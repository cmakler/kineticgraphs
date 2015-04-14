/**
 * Created by cmakler on 4/7/15.
 */
/// <reference path="../kg.ts" />
var KineticGraphs;
(function (KineticGraphs) {
    // The link function registers the axis with the parent graph
    function Axis() {
        function link(scope, element, attributes, graph) {
            var axis = {
                dim: scope.dim,
                domain: {
                    min: scope.min() || 0,
                    max: scope.max() || 10
                },
                title: scope.title || scope.dim + ' axis',
                ticks: scope.ticks() || 5
            };
            graph.addAxis(axis);
        }
        return {
            link: link,
            restrict: 'E',
            require: '^graph',
            scope: { dim: '@', min: '&', max: '&', title: '@', ticks: '&' }
        };
    }
    KineticGraphs.Axis = Axis;
})(KineticGraphs || (KineticGraphs = {}));
/// <reference path="../kg.ts"/>
var KineticGraphs;
(function (KineticGraphs) {
    var RenderedObjects = (function () {
        function RenderedObjects() {
            this.select = function (vis) {
                ['area', 'rect', 'curve', 'line', 'circle'].forEach(function (objName) {
                    this[objName + 's'] = vis.append('g').attr('class', 'graph-objects').selectAll('g.' + objName);
                });
            };
            this.render = function (vis) {
                /*circles = circles.data(data);
                circles.exit().remove();
                circles.enter().append('circle');
                circles
                    .attr('cx', function (d) {
                        return d.cx
                    })
                    .attr('cy', function (d) {
                        return d.cy
                    })
                    .attr('stroke', function(d) {
                        return d.color
                    })
                    .attr('fill', function (d) {
                        return d.color
                    })
                    .attr('r', function (d) {
                        return d.r || 10;
                    });
                return circles;*/
                return vis;
            };
        }
        return RenderedObjects;
    })();
    KineticGraphs.RenderedObjects = RenderedObjects;
})(KineticGraphs || (KineticGraphs = {}));
/**
 * Created by cmakler on 4/8/15.
 */
/// <reference path="../kg.ts"/>
/// <reference path="graphObject.ts"/>
var KineticGraphs;
(function (KineticGraphs) {
    var Point = (function () {
        function Point(scope) {
            this.render = function (graph) {
                var cx = graph.x(this.coordinates.x), cy = graph.y(this.coordinates.y);
                graph.vis.append('circle').attr({ cx: cx, cy: cy, r: 3 });
                return graph;
            };
            this.coordinates = scope.coordinates();
        }
        return Point;
    })();
    KineticGraphs.Point = Point;
    function pointDirective() {
        return {
            restrict: 'E',
            require: '^graph',
            link: function (scope, element, attributes, graph) {
                graph.addComposite(new Point(scope));
            },
            scope: { coordinates: '&' }
        };
    }
    KineticGraphs.pointDirective = pointDirective;
})(KineticGraphs || (KineticGraphs = {}));
/// <reference path="../kg.ts"/>
/// <reference path="helpers.ts"/>
/// <reference path="axis.ts"/>
/// <reference path="graphObject.ts"/>
/// <reference path="point.ts"/>
var KineticGraphs;
(function (KineticGraphs) {
    // Implementation of graph methods
    var GraphController = (function () {
        function GraphController($scope) {
            this.$scope = $scope;
            // add an object to the array of graph objects
            this.addObject = function (newObject) {
                this.$scope.composites.push(newObject);
            };
            // define axis elements for the graph
            // and create the D3 scales for the x and y dimensions
            this.addAxis = function (axis) {
                var name = axis.dim === 'x' ? 'xAxis' : 'yAxis';
                this.$scope[name] = axis;
                this.$scope.drawGraph();
            };
            // expose API to draw graph
            this.drawGraph = this.$scope.drawGraph;
            this.curveFunction = d3.svg.line().x(function (d) {
                return this.x(d.x);
            }).y(function (d) {
                return this.y(d.y);
            }).interpolate("linear");
            this.verticalArea = d3.svg.area().x(function (d) {
                return this.x(d.x);
            }).y0(function (d) {
                return this.y(d.y0);
            }).y1(function (d) {
                return this.y(d.y1);
            });
            this.horizontalArea = d3.svg.area().x0(function (d) {
                return this.x(d.x0);
            }).x1(function (d) {
                return this.x(d.x1);
            }).y(function (d) {
                return this.y(d.y);
            });
            $scope.graphObjects = [];
            $scope.renderedObjects = new KineticGraphs.RenderedObjects();
            $scope.drawObjects = function () {
                $scope.graphObjects.forEach(function (graphObject) {
                    $scope = graphObject.render($scope);
                });
            };
            $scope.drawGraph = function () {
                if ($scope.xAxis && $scope.yAxis && $scope.element) {
                    // Remove existing graph if already drawn
                    if ($scope.vis) {
                        d3.select($scope.element).select('svg').remove();
                        d3.select($scope.element).selectAll('div').remove();
                    }
                    // Get attributes of <graph> element
                    var element = $scope.element, attributes = element.attributes;
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
                    // Create D3 SVG
                    $scope.vis = d3.select($scope.element).append("svg").attr("width", elementDimensions.width).attr("height", elementDimensions.height).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                    // Establish scales
                    var xDomain = $scope.xAxis.domain, yDomain = $scope.yAxis.domain;
                    $scope.x = d3.scale.linear().range([0, graphDimensions.width]).domain([xDomain.min, xDomain.max]);
                    $scope.y = d3.scale.linear().range([graphDimensions.height, 0]).domain([yDomain.min, yDomain.max]);
                    // Establish D3 selectors for rendered object types
                    $scope.renderedObjects.select($scope.vis);
                    var x_axis = $scope.vis.append('g').attr('class', 'x axis').attr("transform", "translate(0," + graphDimensions.height + ")");
                    var y_axis = $scope.vis.append('g').attr('class', 'y axis');
                    var x_axis_label = x_axis.append("text").attr("x", graphDimensions.width / 2).attr("y", "4em").style("text-anchor", "middle");
                    var y_axis_label = y_axis.append("text").attr("transform", "rotate(-90)").attr("x", -graphDimensions.height / 2).attr("y", "-4em").style("text-anchor", "middle");
                    // Add x axis
                    x_axis.call(d3.svg.axis().scale($scope.x).orient("bottom").ticks($scope.xAxis.ticks));
                    x_axis_label.text($scope.xAxis.title);
                    // Add y axis
                    y_axis.call(d3.svg.axis().scale($scope.y).orient("left").ticks($scope.yAxis.ticks));
                    y_axis_label.text($scope.yAxis.title);
                    $scope.drawObjects();
                }
            };
        }
        return GraphController;
    })();
    KineticGraphs.GraphController = GraphController;
    // Creation of graph from element and children
    function Graph() {
        function link(scope, element) {
            scope.element = element[0];
            scope.drawGraph();
        }
        return {
            restrict: 'E',
            transclude: true,
            template: "<div><div ng-transclude/></div>",
            link: link,
            controller: GraphController
        };
    }
    KineticGraphs.Graph = Graph;
})(KineticGraphs || (KineticGraphs = {}));
/// <reference path="../../lib/jquery.d.ts" />
/// <reference path="../../lib/angular.d.ts" />
var KineticGraphs;
(function (KineticGraphs) {
    function Model() {
        return {
            restrict: 'E',
            template: '<div>Here in the model, yo. <div ng-transclude/></div>',
            replace: true,
            transclude: true,
            link: function (scope, element, attributes) {
                scope.min = attributes['min'];
            }
        };
    }
    KineticGraphs.Model = Model;
})(KineticGraphs || (KineticGraphs = {}));
/// <reference path="../lib/jquery.d.ts"/>
/// <reference path="../lib/angular.d.ts"/>
/// <reference path="../lib/d3.d.ts"/>
/// <reference path="graphs/graph.ts" />
/// <reference path="graphs/model.ts" />
angular.module('KineticGraphs', []).directive('graph', KineticGraphs.Graph).directive('point', KineticGraphs.pointDirective).directive('axis', KineticGraphs.Axis);
//# sourceMappingURL=kg.js.map