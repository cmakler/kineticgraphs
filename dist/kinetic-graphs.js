/// <reference path="kg.ts" />
var KineticGraphs;
(function (KineticGraphs) {
    var ModelController = (function () {
        function ModelController($scope, $window) {
            this.$scope = $scope;
            var graphDef = "{element_id:'graph', dimensions: {width: 700, height: 700}, xAxis: {min: 0, max: 10, title: 'Variance'},yAxis: {min: 0, max: 20, title: 'Mean'}, graphObjects:[";
            var point1 = ",{type:'Point', definition: {name:'asset1', show:true, className: 'asset', coordinates: functions.asset1.coordinates()}}";
            var point2 = ",{type:'Point', definition: {name:'asset2', show:true, className: 'asset', coordinates: functions.asset2.coordinates()}}";
            var linePlot = "{type:'Scatter', definition: {name: 'myLinePlot', show: true, className: 'draw', data:functions.portfolio.data()}}";
            var graphDefEnd = "]}";
            $scope.interactiveDefinitions = { graphs: [graphDef + linePlot + point1 + point2 + graphDefEnd], sliders: ["{element_id: 'slider', param: 'correlation', precision: '0.1', axis: {min: -1, max: 1}}"] };
            $scope.params = { correlation: 0.8, mean1: 10, var1: 4, mean2: 13, var2: 5 };
            $scope.functionDefinitions = { finance: [
                { name: 'asset1', model: 'CAPM', type: 'Asset', definition: "{mean: 'mean1', variance: 'var1'}" },
                { name: 'asset2', model: 'CAPM', type: 'Asset', definition: "{mean: 'mean2', variance: 'var2'}" },
                { name: 'portfolio', model: 'CAPM', type: 'Portfolio', definition: "{assets:[functions.asset1, functions.asset2]}" }
            ] };
            $scope.graphParams = { xAxisLabel: 'Quantity' };
            // Creates graph objects from (string) graph definitions
            function createInteractives() {
                var interactives = [];
                if ($scope.hasOwnProperty('interactiveDefinitions')) {
                    if ($scope.interactiveDefinitions.hasOwnProperty('graphs')) {
                        $scope.interactiveDefinitions.graphs.forEach(function (graphDefinition) {
                            interactives.push(new KineticGraphs.Graph(graphDefinition));
                        });
                    }
                    if ($scope.interactiveDefinitions.hasOwnProperty('sliders')) {
                        $scope.interactiveDefinitions.sliders.forEach(function (sliderDefinition) {
                            interactives.push(new KineticGraphs.Slider(sliderDefinition));
                        });
                    }
                }
                return interactives;
            }
            // Creates functions
            function createFunctions() {
                var functions = {};
                if ($scope.hasOwnProperty('functionDefinitions')) {
                    if ($scope.functionDefinitions.hasOwnProperty('finance')) {
                        $scope.functionDefinitions.finance.forEach(function (functionDefinition) {
                            functions[functionDefinition.name] = new FinanceGraphs[functionDefinition.model][functionDefinition.type](functionDefinition.definition);
                        });
                    }
                }
                return functions;
            }
            // Updates and redraws interactive objects (graphs and sliders) when a parameter changes
            function update(redraw) {
                // Create interactive objects if they don't already exist
                $scope.functions = $scope.functions || createFunctions();
                $scope.interactives = $scope.interactives || createInteractives();
                for (var name in $scope.functions) {
                    $scope.functions[name] = $scope.functions[name].update($scope);
                }
                // Update each interactive (updating triggers the graph to redraw its objects and possibly itself)
                $scope.interactives = $scope.interactives.map(function (interactive) {
                    interactive.update($scope);
                    if (redraw) {
                        interactive.redraw();
                    }
                    interactive.drawObjects();
                    return interactive;
                });
            }
            // Erase and redraw all graphs; do this when graph parameters change, or the window is resized
            function redrawGraphs() {
                update(true);
            }
            $scope.$watchCollection('graphParams', redrawGraphs);
            angular.element($window).on('resize', redrawGraphs);
            // Update objects on graphs (not the axes or graphs themselves); to this when model parameters change
            function redrawObjects() {
                update(false);
            }
            $scope.$watchCollection('params', redrawObjects);
        }
        return ModelController;
    })();
    KineticGraphs.ModelController = ModelController;
})(KineticGraphs || (KineticGraphs = {}));
/// <reference path="kg.ts"/>
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
        Domain.prototype.contains = function (x) {
            var lowEnough = (this.max >= x);
            var highEnough = (this.min <= x);
            return lowEnough && highEnough;
        };
        return Domain;
    })();
    KineticGraphs.Domain = Domain;
})(KineticGraphs || (KineticGraphs = {}));
/**
 * Created by cmakler on 4/24/15.
 */
var KineticGraphs;
(function (KineticGraphs) {
    var Parameterizable = (function () {
        // Define using a string
        function Parameterizable(definitionString) {
            this.definitionString = definitionString;
        }
        // Establish the scope, and evaluate the definition under this new scope
        Parameterizable.prototype.update = function (scope) {
            this.scope = scope;
            this.definition = scope.$eval(this.definitionString);
            this._update();
            return this;
        };
        Parameterizable.prototype._update = function () {
        }; //overridden by child class
        return Parameterizable;
    })();
    KineticGraphs.Parameterizable = Parameterizable;
})(KineticGraphs || (KineticGraphs = {}));
/* interactives/interactive.ts */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../kg.ts"/>
/// <reference path="../model/parameterizable.ts"/>
var KineticGraphs;
(function (KineticGraphs) {
    var Interactive = (function (_super) {
        __extends(Interactive, _super);
        function Interactive(definitionString) {
            _super.call(this, definitionString);
        }
        Interactive.prototype.redraw = function () {
            return this; // overridden by child classes
        };
        Interactive.prototype.drawObjects = function () {
            return this;
        };
        // Rules for updating the dimensions fo the graph object, based on current graph element clientWidth
        Interactive.prototype.updateDimensions = function (clientWidth, dimensions) {
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
        };
        return Interactive;
    })(KineticGraphs.Parameterizable);
    KineticGraphs.Interactive = Interactive;
})(KineticGraphs || (KineticGraphs = {}));
/// <reference path="../kg.ts" />
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
            this.tickValues = axisDefinition.tickValues;
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
            axis_vis.call(d3.svg.axis().scale(this.scale).orient("bottom").ticks(this.ticks).tickValues(this.tickValues));
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
            axis_vis.call(d3.svg.axis().scale(this.scale).orient("left").ticks(this.ticks).tickValues(this.tickValues));
        };
        return YAxis;
    })(Axis);
    KineticGraphs.YAxis = YAxis;
})(KineticGraphs || (KineticGraphs = {}));
/// <reference path="../kg.ts"/>
/// <reference path="interactive.ts" />
var KineticGraphs;
(function (KineticGraphs) {
    var Graph = (function (_super) {
        __extends(Graph, _super);
        function Graph(definitionString) {
            _super.call(this, definitionString);
            this.definitionString = definitionString;
            this.xAxis = new KineticGraphs.XAxis();
            this.yAxis = new KineticGraphs.YAxis();
        }
        // Used to update parameters of the model from within the graph
        Graph.prototype.updateParams = function (params) {
            for (var key in params) {
                if (params.hasOwnProperty(key) && this.scope.params.hasOwnProperty(key)) {
                    this.scope.params[key] = params[key];
                }
            }
            this.scope.$apply();
        };
        Graph.prototype.objectGroup = function (name, init) {
            var group = this.vis.select('#' + name);
            // TODO need better way to check if it doesn't yet exist
            if (group[0][0] == null) {
                group = this.vis.append('g').attr('id', name);
                group = init(group);
            }
            return group;
        };
        Graph.prototype.xOnGraph = function (x) {
            return this.xAxis.domain.contains(x);
        };
        Graph.prototype.yOnGraph = function (y) {
            return this.yAxis.domain.contains(y);
        };
        // Check to see if a point is on the graph
        Graph.prototype.onGraph = function (coordinates) {
            return (this.xOnGraph(coordinates.x) && this.yOnGraph(coordinates.y));
        };
        // This should be called with one point on the graph and another off
        Graph.prototype.nearestGraphPoint = function (onGraphPoint, offGraphPoint) {
            return onGraphPoint;
        };
        // Update graph based on latest parameters
        Graph.prototype.redraw = function () {
            var graph = this, definition = this.definition, updateDimensions = this.updateDimensions;
            // Redraw the graph if necessary
            console.log('redrawing graph!');
            // Establish dimensions of the graph
            var element = $('#' + definition.element_id)[0];
            var dimensions = updateDimensions(element.clientWidth, definition.dimensions);
            var margins = definition.margins || { top: 20, left: 100, bottom: 100, right: 20 };
            // Update axis objects
            graph.xAxis.update(definition.xAxis);
            graph.yAxis.update(definition.yAxis);
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
            return graph;
        };
        Graph.prototype.drawObjects = function () {
            var graph = this, definition = this.definition;
            if (!graph.graphObjects || graph.graphObjects == undefined) {
                graph.graphObjects = new KineticGraphs.GraphObjects(definition.graphObjects);
            }
            // Update graphObject graph objects based on change in scope
            return graph.graphObjects.update(definition.graphObjects).render(graph);
        };
        return Graph;
    })(KineticGraphs.Interactive);
    KineticGraphs.Graph = Graph;
})(KineticGraphs || (KineticGraphs = {}));
/// <reference path="../kg.ts"/>
/// <reference path="interactive.ts" />
var KineticGraphs;
(function (KineticGraphs) {
    var Slider = (function (_super) {
        __extends(Slider, _super);
        function Slider(definitionString) {
            _super.call(this, definitionString);
            this.definitionString = definitionString;
            this.axis = new KineticGraphs.XAxis();
        }
        Slider.prototype.redraw = function () {
            var slider = this, scope = this.scope, definition = this.definition, updateDimensions = this.updateDimensions;
            console.log('redrawing slider!');
            // Set default height to 50
            if (!definition.hasOwnProperty('dimensions')) {
                definition.dimensions = { height: 50, width: 300 };
            }
            // Set defualt precision to 1
            if (!definition.hasOwnProperty('precision')) {
                definition.precision = 1;
            }
            // Establish dimensions of the graph
            var element = $('#' + definition.element_id)[0];
            var dimensions = updateDimensions(element.clientWidth, definition.dimensions);
            var radius = dimensions.height / 2;
            var margins = { top: radius, left: radius, bottom: radius, right: radius };
            // Update axis object
            slider.axis.update(definition.axis);
            slider.axis.tickValues = slider.axis.domain.toArray();
            // Remove existing slider
            d3.select(element).select('svg').remove();
            // Create new SVG element for the graph visualization
            slider.vis = d3.select(element).append("svg").attr("width", dimensions.width).attr("height", dimensions.height).append("g").attr("transform", "translate(" + radius + "," + radius + ")");
            // Establish dimensions of axes (element dimensions minus margins)
            var axisDimensions = {
                width: dimensions.width - margins.left - margins.right,
                height: 0
            };
            // draw axes
            slider.axis.draw(slider.vis, axisDimensions);
            // establish drag behavior
            var drag = d3.behavior.drag().on("drag", function () {
                var rawValue = slider.axis.scale.invert(d3.event.x);
                var boundedValue = Math.max(slider.axis.domain.min, Math.min(slider.axis.domain.max, rawValue));
                scope.params[definition.param] = Math.round(boundedValue / definition.precision) * definition.precision;
                scope.$apply();
            });
            slider.circle = slider.vis.append('circle').attr({ cy: 0, r: radius / 2 }).call(drag);
            return slider;
        };
        Slider.prototype.drawObjects = function () {
            var circle = this.circle, scale = this.axis.scale, newValue = this.scope.params[this.definition.param];
            circle.attr('cx', scale(newValue));
            return this;
        };
        return Slider;
    })(KineticGraphs.Interactive);
    KineticGraphs.Slider = Slider;
})(KineticGraphs || (KineticGraphs = {}));
/// <reference path="../kg.ts"/>
var KineticGraphs;
(function (KineticGraphs) {
    var GraphObject = (function () {
        function GraphObject() {
        }
        GraphObject.prototype.classAndVisibility = function () {
            var VISIBLE_CLASS = this.className + ' visible', INVISIBLE_CLASS = this.className + ' invisible';
            return this.show ? VISIBLE_CLASS : INVISIBLE_CLASS;
        };
        GraphObject.prototype.update = function (definition) {
            if (!definition.hasOwnProperty('name')) {
                console.log('error: a name is required of all objects!');
            }
            var currentDefinition = this;
            // ensure that the required attributes exist
            currentDefinition.className = (currentDefinition.hasOwnProperty('className')) ? definition.className : '';
            currentDefinition.show = (currentDefinition.hasOwnProperty('show')) ? definition.show : true;
            currentDefinition.name = definition.name;
            for (var key in definition) {
                if (currentDefinition.hasOwnProperty(key) && definition.hasOwnProperty(key) && currentDefinition[key] != definition[key]) {
                    currentDefinition[key] = definition[key];
                }
            }
            return currentDefinition;
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
/// <reference path="../kg.ts"/>
/// <reference path="graphObjects.ts"/>
var KineticGraphs;
(function (KineticGraphs) {
    var Point = (function (_super) {
        __extends(Point, _super);
        function Point() {
            _super.call(this);
            // establish defaults
            this.coordinates = { x: 0, y: 0 };
            this.size = 100;
            this.symbol = 'circle';
        }
        Point.prototype.render = function (graph) {
            // constants TODO should these be defined somewhere else?
            var POINT_SYMBOL_CLASS = 'pointSymbol';
            var xRaw = this.coordinates.x, yRaw = this.coordinates.y;
            var x, y, xDrag, yDrag;
            if (typeof xRaw == 'string') {
                x = graph.xAxis.scale(graph.scope.$eval('params.' + xRaw));
                xDrag = true;
            }
            else {
                x = graph.xAxis.scale(xRaw);
                xDrag = false;
            }
            if (typeof yRaw == 'string' && graph.scope.params.hasOwnProperty(yRaw)) {
                y = graph.yAxis.scale(graph.scope.params[yRaw]);
                yDrag = true;
            }
            else {
                y = graph.yAxis.scale(yRaw);
                yDrag = false;
            }
            // initialization of D3 graph object group
            function init(newGroup) {
                newGroup.append('path').attr('class', POINT_SYMBOL_CLASS);
                return newGroup;
            }
            var group = graph.objectGroup(this.name, init);
            // establish drag behavior
            var drag = d3.behavior.drag().on("drag", function () {
                var dragUpdate = {};
                if (xDrag) {
                    dragUpdate[xRaw] = graph.xAxis.scale.invert(d3.event.x);
                }
                if (yDrag) {
                    dragUpdate[yRaw] = graph.yAxis.scale.invert(d3.event.y);
                }
                graph.updateParams(dragUpdate);
            });
            // draw the symbol at the point
            var pointSymbol = group.select('.' + POINT_SYMBOL_CLASS);
            if (this.symbol === 'none') {
                pointSymbol.attr('class', 'invisible ' + POINT_SYMBOL_CLASS);
            }
            else {
                pointSymbol.attr({
                    'class': this.classAndVisibility() + ' ' + POINT_SYMBOL_CLASS,
                    'd': d3.svg.symbol().type(this.symbol).size(this.size),
                    'transform': "translate(" + x + "," + y + ")"
                }).call(drag);
            }
            return graph;
        };
        return Point;
    })(KineticGraphs.GraphObject);
    KineticGraphs.Point = Point;
})(KineticGraphs || (KineticGraphs = {}));
/// <reference path="../kg.ts"/>
/// <reference path="graphObjects.ts"/>
var KineticGraphs;
(function (KineticGraphs) {
    var LinePlot = (function (_super) {
        __extends(LinePlot, _super);
        function LinePlot() {
            _super.call(this);
            this.data = [];
        }
        LinePlot.prototype.render = function (graph) {
            // constants TODO should these be defined somewhere else?
            var DATA_PATH_CLASS = 'dataPath';
            function init(newGroup) {
                newGroup.append('path').attr('class', DATA_PATH_CLASS);
                return newGroup;
            }
            var group = graph.objectGroup(this.name, init);
            var dataLine = d3.svg.line().interpolate('linear').x(function (d) {
                return graph.xAxis.scale(d.x);
            }).y(function (d) {
                return graph.yAxis.scale(d.y);
            });
            var dataPath = group.select('.' + DATA_PATH_CLASS);
            dataPath.attr({
                'class': this.classAndVisibility() + ' ' + DATA_PATH_CLASS,
                'd': dataLine(this.data)
            });
            return graph;
        };
        return LinePlot;
    })(KineticGraphs.GraphObject);
    KineticGraphs.LinePlot = LinePlot;
})(KineticGraphs || (KineticGraphs = {}));
/// <reference path="../kg.ts"/>
/// <reference path="graphObjects.ts"/>
var KineticGraphs;
(function (KineticGraphs) {
    var Scatter = (function (_super) {
        __extends(Scatter, _super);
        function Scatter() {
            _super.call(this);
            // establish defaults
            this.data = [];
            this.size = 50;
            this.symbol = 'circle';
        }
        Scatter.prototype.render = function (graph) {
            // constants TODO should these be defined somewhere else?
            var DATA_PATH_CLASS = 'scatter';
            function init(newGroup) {
                return newGroup;
            }
            var group = graph.objectGroup(this.name, init);
            var dataPoints = group.selectAll('.' + DATA_PATH_CLASS).data(this.data);
            dataPoints.enter().append('path').attr('class', this.classAndVisibility() + ' ' + DATA_PATH_CLASS);
            dataPoints.attr({ 'd': d3.svg.symbol().type(this.symbol).size(this.size), 'transform': function (d) {
                return "translate(" + graph.xAxis.scale(d.x) + "," + graph.yAxis.scale(d.y) + ")";
            } });
            return graph;
        };
        return Scatter;
    })(KineticGraphs.GraphObject);
    KineticGraphs.Scatter = Scatter;
})(KineticGraphs || (KineticGraphs = {}));
/**
 * Created by cmakler on 4/24/15.
 */
var FinanceGraphs;
(function (FinanceGraphs) {
    var CAPM;
    (function (CAPM) {
        var Asset = (function (_super) {
            __extends(Asset, _super);
            function Asset(definitionString) {
                _super.call(this, definitionString);
            }
            Asset.prototype._update = function () {
                this.mean = this.definition.mean;
                this.variance = this.definition.variance;
            };
            Asset.prototype.coordinates = function () {
                return { x: this.variance, y: this.mean };
            };
            return Asset;
        })(KineticGraphs.Interactive);
        CAPM.Asset = Asset;
        var Portfolio = (function (_super) {
            __extends(Portfolio, _super);
            function Portfolio(definitionString) {
                _super.call(this, definitionString);
            }
            Portfolio.prototype.data = function () {
                var asset1 = this.definition.assets[0];
                var asset2 = this.definition.assets[1];
                var scope = this.scope;
                function dataPoints(a, b) {
                    var dataset = [];
                    var mean, variance;
                    function propertyAsNumber(o, p, scope) {
                        var v;
                        if (o.hasOwnProperty(p)) {
                            if (typeof o[p] == 'string') {
                                v = scope.$eval('params.' + o[p]);
                            }
                            else {
                                v = o[p];
                            }
                        }
                        return v;
                    }
                    function convexCombination(a, b, percent) {
                        return (percent * a + (100 - percent) * b) / 100;
                    }
                    function varianceWithCorrelation(variance1, variance2, correlation, percent) {
                        var fraction = percent / 100;
                        return fraction * fraction * variance1 + fraction * (1 - fraction) * correlation + (1 - fraction) * (1 - fraction) * variance2;
                    }
                    var mean1 = propertyAsNumber(asset1, 'mean', scope), variance1 = propertyAsNumber(asset1, 'variance', scope), mean2 = propertyAsNumber(asset2, 'mean', scope), variance2 = propertyAsNumber(asset2, 'variance', scope);
                    for (var i = 1; i < 10; i++) {
                        mean = convexCombination(mean1, mean2, i * 10);
                        variance = varianceWithCorrelation(variance1, variance2, scope.params.correlation, i * 10);
                        dataset.push({ x: variance, y: mean });
                    }
                    return dataset;
                }
                return dataPoints(asset1, asset2);
            };
            return Portfolio;
        })(KineticGraphs.Interactive);
        CAPM.Portfolio = Portfolio;
    })(CAPM = FinanceGraphs.CAPM || (FinanceGraphs.CAPM = {}));
})(FinanceGraphs || (FinanceGraphs = {}));
/// <reference path="../bower_components/DefinitelyTyped/jquery/jquery.d.ts" />
/// <reference path="../bower_components/DefinitelyTyped/angularjs/angular.d.ts"/>
/// <reference path="../bower_components/DefinitelyTyped/d3/d3.d.ts"/>
/// <reference path="model.ts" />
/// <reference path="helpers.ts" />
/// <reference path="interactives/interactive.ts" />
/// <reference path="interactives/axis.ts" />
/// <reference path="interactives/graph.ts" />
/// <reference path="interactives/slider.ts" />
/// <reference path="graphObjects/graphObjects.ts" />
/// <reference path="graphObjects/point.ts" />
/// <reference path="graphObjects/linePlot.ts" />
/// <reference path="graphObjects/scatter.ts" />
/// <reference path="finance/capm.ts"/>
angular.module('KineticGraphs', []).controller('KineticGraphCtrl', KineticGraphs.ModelController);
//# sourceMappingURL=kinetic-graphs.js.map