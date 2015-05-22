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
    function translateByPixelCoordinates(coordinates) {
        return 'translate(' + coordinates.x + ',' + coordinates.y + ')';
    }
    KineticGraphs.translateByPixelCoordinates = translateByPixelCoordinates;
    function positionByPixelCoordinates(coordinates, dimension) {
        var style = 'position:relative; left: ' + coordinates.x + 'px; top: ' + coordinates.y + 'px;';
        if (dimension) {
            if (dimension.hasOwnProperty('width')) {
                style += ' width: ' + dimension.width + 'px;';
            }
        }
        return style;
    }
    KineticGraphs.positionByPixelCoordinates = positionByPixelCoordinates;
    function createInstance(definition) {
        // from http://stackoverflow.com/questions/1366127/
        function typeSpecificConstructor(typeName) {
            var arr = typeName.split(".");
            var fn = (window || this);
            for (var i = 0, len = arr.length; i < len; i++) {
                fn = fn[arr[i]];
            }
            if (typeof fn !== "function") {
                throw new Error("object type " + typeName + " not found");
            }
            return fn;
        }
        // each object is a new instance of the class named in the 'type' parameter
        var newObjectConstructor = typeSpecificConstructor(definition.type);
        return new newObjectConstructor(definition.definition);
    }
    KineticGraphs.createInstance = createInstance;
})(KineticGraphs || (KineticGraphs = {}));
var KineticGraphs;
(function (KineticGraphs) {
    var Model = (function () {
        function Model(definition) {
            this.definition = definition;
            var model = this;
            for (var key in definition) {
                if (definition.hasOwnProperty(key)) {
                    var value = definition[key];
                    if (value.hasOwnProperty('type') && value.hasOwnProperty('definition')) {
                        model[key] = KineticGraphs.createInstance(value);
                    }
                }
            }
        }
        // Update the model
        Model.prototype.update = function (scope, callback) {
            var model = this;
            // Iterates over an object's definition, getting the current value of each property
            function parseObject(def, obj) {
                obj = obj || {};
                for (var key in def) {
                    if (def.hasOwnProperty(key)) {
                        if (obj[key] instanceof KineticGraphs.Model) {
                            // if the property is itself a model, update the model
                            obj[key].update(scope);
                        }
                        else {
                            // otherwise parse the current value of the property
                            obj[key] = deepParse(def[key]);
                        }
                    }
                }
                return obj;
            }
            // Returns the value of an object's property, evaluated against the current scope.
            function deepParse(value) {
                if (Object.prototype.toString.call(value) == '[object Array]') {
                    // If the object's property is an array, return the array mapped to its parsed values
                    // see http://stackoverflow.com/questions/4775722/check-if-object-is-array
                    return value.map(deepParse);
                }
                else if (typeof value == 'object') {
                    // If the object's property is an object, parses the object.
                    return parseObject(value);
                }
                else {
                    var e = scope.$eval(value.toString());
                    return (e == undefined) ? value : e;
                }
            }
            // Parse the model object
            model = parseObject(model.definition, model);
            if (callback) {
                callback();
            }
            return model;
        };
        return Model;
    })();
    KineticGraphs.Model = Model;
})(KineticGraphs || (KineticGraphs = {}));
/// <reference path="../kg.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var KineticGraphs;
(function (KineticGraphs) {
    var ViewObject = (function (_super) {
        __extends(ViewObject, _super);
        function ViewObject(definition) {
            definition = _.defaults(definition, { className: '', show: true });
            _super.call(this, definition);
        }
        ViewObject.prototype.classAndVisibility = function () {
            var VISIBLE_CLASS = this.className + ' visible', INVISIBLE_CLASS = this.className + ' invisible';
            return this.show ? VISIBLE_CLASS : INVISIBLE_CLASS;
        };
        ViewObject.prototype.render = function (graph) {
            return graph; // overridden by child class
        };
        return ViewObject;
    })(KineticGraphs.Model);
    KineticGraphs.ViewObject = ViewObject;
})(KineticGraphs || (KineticGraphs = {}));
/// <reference path="../kg.ts"/>
var KineticGraphs;
(function (KineticGraphs) {
    var Point = (function (_super) {
        __extends(Point, _super);
        function Point(definition) {
            definition = _.defaults(definition, { coordinates: { x: 0, y: 0 }, size: 100, symbol: 'circle', label: '' });
            _super.call(this, definition);
            //this.labelDiv = new GraphDiv({coordinates: definition.coordinates, label: definition.label});
        }
        Point.prototype.render = function (view) {
            var point = this, label = this.label;
            // constants TODO should these be defined somewhere else?
            var POINT_SYMBOL_CLASS = 'pointSymbol';
            // initialization of D3 graph object group
            function init(newGroup) {
                newGroup.append('path').attr('class', POINT_SYMBOL_CLASS);
                return newGroup;
            }
            var group = view.objectGroup(point.name, init);
            var showPoint = function () {
                if (point.symbol === 'none') {
                    return false;
                }
                return view.onGraph(point.coordinates);
            }();
            // draw the symbol at the point
            var pointSymbol = group.select('.' + POINT_SYMBOL_CLASS);
            if (showPoint) {
                pointSymbol.attr({
                    'class': point.classAndVisibility() + ' ' + POINT_SYMBOL_CLASS,
                    'd': d3.svg.symbol().type(point.symbol).size(point.size),
                    'transform': view.translateByCoordinates(point.coordinates)
                });
            }
            else {
                pointSymbol.attr('class', 'invisible ' + POINT_SYMBOL_CLASS);
            }
            return view;
        };
        return Point;
    })(KineticGraphs.ViewObject);
    KineticGraphs.Point = Point;
})(KineticGraphs || (KineticGraphs = {}));
/// <reference path="kg.ts"/>
var KineticGraphs;
(function (KineticGraphs) {
    var View = (function (_super) {
        __extends(View, _super);
        function View(definition) {
            _super.call(this, definition);
            if (definition.hasOwnProperty('xAxis')) {
                this.xAxis = new KineticGraphs.XAxis(definition.xAxis);
            }
            if (definition.hasOwnProperty('yAxis')) {
                this.yAxis = new KineticGraphs.YAxis(definition.yAxis);
            }
        }
        View.prototype.render = function (scope, redraw) {
            var view = this;
            view.update(scope, function () {
                if (redraw) {
                    view.redraw(scope);
                }
                else {
                    view.drawObjects(scope);
                }
            });
        };
        View.prototype.redraw = function (scope) {
            var view = this;
            // Redraw the view if necessary
            console.log('redrawing view!');
            // Establish dimensions of the view
            var element = $('#' + view.element_id)[0];
            view.dimensions.width = Math.min(view.dimensions.width, element.clientWidth);
            var frameTranslation = KineticGraphs.positionByPixelCoordinates({ x: 0, y: 0 });
            var visTranslation = KineticGraphs.translateByPixelCoordinates({ x: view.margins.left, y: view.margins.top });
            d3.select(element).select('div').remove();
            // Create new div element to contain SVG
            var frame = d3.select(element).append('div').attr({ style: frameTranslation });
            // Create new SVG element for the view visualization
            var svg = frame.append("svg").attr("width", view.dimensions.width).attr("height", view.dimensions.height);
            // Add a div above the SVG for labels and controls
            view.divs = frame.append('div').attr({ style: visTranslation });
            // Establish SVG groups for visualization area (vis), mask, axes
            view.vis = svg.append("g").attr("transform", visTranslation);
            var mask = svg.append("g").attr("class", "mask");
            // Put mask around vis to clip objects that extend beyond the desired viewable area
            mask.append("rect").attr({ x: 0, y: 0, width: view.dimensions.width, height: view.margins.top });
            mask.append("rect").attr({ x: 0, y: view.dimensions.height - view.margins.bottom, width: view.dimensions.width, height: view.margins.bottom });
            mask.append("rect").attr({ x: 0, y: 0, width: view.margins.left, height: view.dimensions.height });
            mask.append("rect").attr({ x: view.dimensions.width - view.margins.right, y: 0, width: view.margins.right, height: view.dimensions.height });
            if (view.xAxis || view.yAxis) {
                // Establish SVG group for axes
                var axes = svg.append("g").attr("class", "axes").attr("transform", visTranslation);
                // Establish dimensions of axes (element dimensions minus margins)
                var axisDimensions = {
                    width: view.dimensions.width - view.margins.left - view.margins.right,
                    height: view.dimensions.height - view.margins.top - view.margins.bottom
                };
                // draw axes
                if (view.xAxis) {
                    view.xAxis.draw(axes, axisDimensions);
                }
                if (view.yAxis) {
                    view.yAxis.draw(axes, axisDimensions);
                }
            }
            return view.drawObjects(scope);
        };
        View.prototype.drawObjects = function (scope) {
            var view = this;
            view.objects.forEach(function (object) {
                object.update(scope).render(view);
            });
            return view;
        };
        return View;
    })(KineticGraphs.Model);
    KineticGraphs.View = View;
})(KineticGraphs || (KineticGraphs = {}));
/// <reference path="../kg.ts" />
var KineticGraphs;
(function (KineticGraphs) {
    var Axis = (function (_super) {
        __extends(Axis, _super);
        function Axis(definition) {
            definition = _.defaults(definition, {
                min: 0,
                max: 10,
                title: '',
                ticks: 5
            });
            _super.call(this, definition);
            this.domain = new KineticGraphs.Domain(definition.min, definition.max);
        }
        Axis.prototype.draw = function (vis, graph_definition) {
            // overridden by child class
        };
        Axis.prototype.scaleFunction = function (pixelLength, domain) {
            return d3.scale.linear(); // overridden by child class
        };
        return Axis;
    })(KineticGraphs.Model);
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
var KineticGraphs;
(function (KineticGraphs) {
    var Graph = (function (_super) {
        __extends(Graph, _super);
        function Graph(definition) {
            // ensure dimensions and margins are set; set any missing elements to defaults
            definition.dimensions = _.defaults(definition.dimensions || {}, { width: 500, height: 500 });
            definition.margins = _.defaults(definition.margins || {}, { top: 20, left: 100, bottom: 100, right: 20 });
            _super.call(this, definition);
            this.xAxis = new KineticGraphs.XAxis(definition.xAxis);
            this.yAxis = new KineticGraphs.YAxis(definition.yAxis);
            this.graphDivs = [];
        }
        /*// Used to update parameters of the model from within the graph
        updateParams(params:any) {
            for (var key in params) {
                if (params.hasOwnProperty(key) && this.scope.params.hasOwnProperty(key)) {
                    this.scope.params[key] = params[key];
                }
            }
            this.scope.$apply();
        }*/
        Graph.prototype.objectGroup = function (name, init) {
            var group = this.vis.select('#' + name);
            if (group.empty()) {
                group = this.vis.append('g').attr('id', name);
                group = init(group);
            }
            return group;
        };
        Graph.prototype.getDiv = function (name) {
            var selection = this.divs.select('#' + name);
            if (selection.empty()) {
                selection = this.divs.append('div').attr('id', name);
            }
            return selection;
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
        // Convert model coordinates to pixel coordinates for a single point
        Graph.prototype.pixelCoordinates = function (coordinates) {
            coordinates.x = this.xAxis.scale(coordinates.x);
            coordinates.y = this.yAxis.scale(coordinates.y);
            return coordinates;
        };
        // Transform pixel coordinates
        Graph.prototype.translateByCoordinates = function (coordinates) {
            return KineticGraphs.translateByPixelCoordinates(this.pixelCoordinates(coordinates));
        };
        Graph.prototype.positionByCoordinates = function (coordinates, dimension) {
            return KineticGraphs.positionByPixelCoordinates(this.pixelCoordinates(coordinates), dimension);
        };
        // Convert model coordinates to pixel coordinates for an array of points
        Graph.prototype.dataCoordinates = function (coordinateArray) {
            var graph = this;
            return coordinateArray.map(graph.pixelCoordinates, graph);
        };
        return Graph;
    })(KineticGraphs.View);
    KineticGraphs.Graph = Graph;
})(KineticGraphs || (KineticGraphs = {}));
/// <reference path="kg.ts" />
var KineticGraphs;
(function (KineticGraphs) {
    var Controller = (function () {
        function Controller($scope, $window) {
            this.$scope = $scope;
            $scope.init = function (definition) {
                $scope.params = definition.params;
                $scope.model = KineticGraphs.createInstance(definition.model);
                $scope.model.update($scope, function () {
                    $scope.views = definition.views.map(function (view) {
                        return KineticGraphs.createInstance(view);
                    });
                });
            };
            // Updates and redraws interactive objects (graphs and sliders) when a parameter changes
            function render(redraw) {
                $scope.model.update($scope, function () {
                    $scope.views.forEach(function (view) {
                        view.render($scope, redraw);
                    });
                });
            }
            // Erase and redraw all graphs; do this when graph parameters change, or the window is resized
            function redrawGraphs() {
                render(true);
            }
            $scope.$watchCollection('graphParams', redrawGraphs);
            angular.element($window).on('resize', redrawGraphs);
            // Update objects on graphs (not the axes or graphs themselves); to this when model parameters change
            function redrawObjects() {
                render(false);
            }
            $scope.$watchCollection('params', redrawObjects);
            $scope.init({
                params: {
                    x: 5,
                    y: 5
                },
                model: {
                    type: 'Sample.TwoPoints',
                    definition: {
                        point1: {
                            type: 'Sample.SinglePoint',
                            definition: {
                                name: 'p1',
                                x: 'params.x',
                                y: 6
                            }
                        },
                        point2: {
                            type: 'Sample.SinglePoint',
                            definition: {
                                name: 'p2',
                                x: 3,
                                y: 'params.y'
                            }
                        }
                    }
                },
                views: [
                    {
                        type: 'KineticGraphs.Graph',
                        definition: {
                            element_id: 'graph',
                            dimensions: { width: 700, height: 700 },
                            xAxis: { min: 0, max: 10, title: '"Standard Deviation"' },
                            yAxis: { min: 0, max: 10, title: '"Mean"' },
                            objects: ['model.point1.point()']
                        }
                    }
                ]
            });
            render(true);
            /*var graphDef = "{element_id:'graph', dimensions: {width: 700, height: 700}, xAxis: {min: 0, max: 1, title: 'Standard Deviation'},yAxis: {min: 0, max: 0.5, title: 'Mean'}, graphObjects:[";
             var point1 = ",{type:'ControlDiv', definition: {name:'asset1', show:true, className: 'asset', text:'a_1', coordinates: functions.asset1.coordinates()}}";
             var point2 = ",{type:'ControlDiv', definition: {name:'asset2', show:true, className: 'asset', text:'a_2', coordinates: functions.asset2.coordinates()}}";
             var point3 = ",{type:'ControlDiv', definition: {name:'asset3', show:true, className: 'asset', text:'a_3', coordinates: functions.asset3.coordinates()}}";
             var linePlot3 = ",{type:'LinePlot', definition: {name: 'myLinePlot3', show: true, className: 'draw', data:functions.portfolio.twoAssetPortfolio(0,1,[0,0,0],params.maxLeverage)}}";
             var linePlot2 = ",{type:'LinePlot', definition: {name: 'myLinePlot2', show: true, className: 'draw', data:functions.portfolio.twoAssetPortfolio(1,2,[0,0,0],params.maxLeverage)}}";
             var linePlot1 = "{type:'LinePlot', definition: {name: 'myLinePlot1', show: true, className: 'draw', data:functions.portfolio.twoAssetPortfolio(0,2,[0,0,0],params.maxLeverage)}}";
             var portfolioPaths = ",{type:'PathFamily', definition: {name: 'myDataPaths', show: true, className: 'draw', data:functions.portfolio.data(params.maxLeverage)}}";
             var graphDefEnd = "]}";
             $scope.interactiveDefinitions = {
             graphs: [graphDef + linePlot1 + linePlot2 + linePlot3 + portfolioPaths + point1 + point2 + point3 + graphDefEnd],
             sliders: [
             "{element_id: 'slider12', param: 'rho01', precision: '0.1', axis: {min: -1, max: 1, tickValues: [-1,0,1]}}",
             "{element_id: 'slider23', param: 'rho12', precision: '0.1', axis: {min: -0.5, max: 0.5, tickValues: [-0.5,0,0.5]}}",
             "{element_id: 'slider13', param: 'rho02', precision: '0.1', axis: {min: -0.5, max: 0.5, tickValues: [-0.5,0,0.5]}}",
             "{element_id: 'leverageSlider', param: 'maxLeverage', precision: '1', axis: {min: 0, max: 400, tickValues: [0,200,400]}}"
             ]
             };
             $scope.params = ;
             $scope.functionDefinitions = {finance: [
             {name: 'asset1', model: 'PortfolioAnalysis', type: 'Asset', definition: "{mean: 'mean1', stdev: 'stdev1'}"},
             {name: 'asset2', model: 'PortfolioAnalysis', type: 'Asset', definition: "{mean: 'mean2', stdev: 'stdev2'}"},
             {name: 'asset3', model: 'PortfolioAnalysis', type: 'Asset', definition: "{mean: 'mean3', stdev: 'stdev3'}"},
             {name: 'portfolio', model: 'PortfolioAnalysis', type: 'Portfolio', definition: "{assets:[functions.asset1, functions.asset2, functions.asset3], correlationCoefficients: {rho12: params.rho12, rho23: params.rho23, rho13: params.rho13}}"}
             ]};

             // Creates graph objects from (string) graph definitions
             function createViews() {
             var interactives:IView[] = [];
             if($scope.hasOwnProperty('interactiveDefinitions')){
             if($scope.interactiveDefinitions.hasOwnProperty('graphs')) {
             $scope.interactiveDefinitions.graphs.forEach(function(graphDefinition) {
             interactives.push(new Graph(graphDefinition))
             })
             }
             if($scope.interactiveDefinitions.hasOwnProperty('sliders')) {
             $scope.interactiveDefinitions.sliders.forEach(function(sliderDefinition) {
             interactives.push(new Slider(sliderDefinition))
             })
             }
             }
             return interactives;
             }

             // Creates functions
             function createFunctions() {
             var functions = {};
             if($scope.hasOwnProperty('functionDefinitions')){
             if($scope.functionDefinitions.hasOwnProperty('finance')) {
             $scope.functionDefinitions.finance.forEach(function(functionDefinition) {
             functions[functionDefinition.name] = new FinanceGraphs[functionDefinition.model][functionDefinition.type](functionDefinition.definition);
             })
             }
             }
             return functions;
             }*/
        }
        return Controller;
    })();
    KineticGraphs.Controller = Controller;
})(KineticGraphs || (KineticGraphs = {}));
/**
 * Created by cmakler on 5/21/15.
 */
var Sample;
(function (Sample) {
    var SinglePoint = (function (_super) {
        __extends(SinglePoint, _super);
        function SinglePoint(definition) {
            _super.call(this, definition);
            this.p = new KineticGraphs.Point({ name: definition.name, coordinates: { x: definition.x, y: definition.y } });
        }
        SinglePoint.prototype.coordinates = function () {
            return { x: this.x, y: this.y };
        };
        SinglePoint.prototype.point = function () {
            var p = this.p;
            p.coordinates = this.coordinates();
            return p;
        };
        return SinglePoint;
    })(KineticGraphs.Model);
    Sample.SinglePoint = SinglePoint;
    var TwoPoints = (function (_super) {
        __extends(TwoPoints, _super);
        function TwoPoints(definition) {
            _super.call(this, definition);
        }
        return TwoPoints;
    })(KineticGraphs.Model);
    Sample.TwoPoints = TwoPoints;
})(Sample || (Sample = {}));
/// <reference path="../bower_components/DefinitelyTyped/jquery/jquery.d.ts" />
/// <reference path="../bower_components/DefinitelyTyped/jquery.color/jquery.color.d.ts" />
/// <reference path="../bower_components/DefinitelyTyped/angularjs/angular.d.ts"/>
/// <reference path="../bower_components/DefinitelyTyped/d3/d3.d.ts"/>
/// <reference path="../bower_components/DefinitelyTyped/underscore/underscore.d.ts"/>
/// <reference path="helpers.ts" />
/// <reference path="model.ts" />
/// <reference path="viewObjects/viewObject.ts"/>
/// <reference path="viewObjects/point.ts"/>
/// <reference path="view.ts" />
/// <reference path="views/axis.ts" />
/// <reference path="views/graph.ts" />
/// <reference path="controller.ts" />
/// <reference path="sample/sample.ts" />
angular.module('KineticGraphs', []).controller('KineticGraphCtrl', KineticGraphs.Controller);
//# sourceMappingURL=kinetic-graphs.js.map