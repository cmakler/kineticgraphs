/// <reference path="kg.ts"/>
'use strict';
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
'use strict';
var KineticGraphs;
(function (KineticGraphs) {
    var Model = (function () {
        function Model(definition) {
            this.definition = definition;
            var model = this;
            for (var key in definition) {
                if (definition.hasOwnProperty(key) && definition[key] != undefined) {
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
                        else if (def[key] !== undefined) {
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
                else if (value.toString() !== undefined) {
                    var e = scope.$eval(value.toString());
                    return (e == undefined) ? value : e;
                }
                else {
                    return value;
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
'use strict';
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
            this.xDragDelta = 0;
            this.yDragDelta = 0;
        }
        ViewObject.prototype.classAndVisibility = function () {
            var classString = this.viewObjectClass;
            if (this.className) {
                classString += ' ' + this.className;
            }
            if (this.show) {
                classString += ' visible';
            }
            else {
                classString += ' invisible';
            }
            return classString;
        };
        ViewObject.prototype.render = function (view) {
            return view; // overridden by child class
        };
        ViewObject.prototype.createSubObjects = function (view) {
            return view; // overridden by child class
        };
        ViewObject.prototype.initGroupFn = function () {
            var viewObjectSVGtype = this.viewObjectSVGtype, viewObjectClass = this.viewObjectClass;
            return function (newGroup) {
                newGroup.append(viewObjectSVGtype).attr('class', viewObjectClass);
                return newGroup;
            };
        };
        ViewObject.prototype.setDragBehavior = function (view, obj) {
            var viewObj = this;
            if (!viewObj.hasOwnProperty('xDragParam')) {
                // allow vertical dragging only
                obj.style('cursor', 'ns-resize');
                obj.call(view.drag(null, viewObj.yDragParam, 0, viewObj.yDragDelta));
            }
            else if (!viewObj.hasOwnProperty('yDragParam')) {
                // allow horizontal dragging only
                obj.style('cursor', 'ew-resize');
                obj.call(view.drag(viewObj.xDragParam, null, viewObj.xDragDelta, 0));
            }
            else {
                // allow bidirectional dragging
                obj.style('cursor', 'move');
                obj.call(view.drag(viewObj.xDragParam, viewObj.yDragParam, viewObj.xDragDelta, viewObj.yDragDelta));
            }
            return view;
        };
        return ViewObject;
    })(KineticGraphs.Model);
    KineticGraphs.ViewObject = ViewObject;
})(KineticGraphs || (KineticGraphs = {}));
/// <reference path="../kg.ts"/>
'use strict';
var KineticGraphs;
(function (KineticGraphs) {
    var Point = (function (_super) {
        __extends(Point, _super);
        function Point(definition) {
            definition = _.defaults(definition, { coordinates: { x: 0, y: 0 }, size: 100, symbol: 'circle' });
            _super.call(this, definition);
            if (definition.label) {
                this.labelDiv = new KineticGraphs.GraphDiv(definition);
            }
            this.viewObjectSVGtype = 'path';
            this.viewObjectClass = 'pointSymbol';
        }
        Point.prototype.createSubObjects = function (view) {
            var labelDiv = this.labelDiv;
            if (labelDiv) {
                return view.addObject(labelDiv);
            }
            else {
                return view;
            }
        };
        Point.prototype.render = function (view) {
            var point = this, draggable = (point.hasOwnProperty('xDragParam') || point.hasOwnProperty('yDragParam'));
            ;
            var group = view.objectGroup(point.name, point.initGroupFn(), true);
            if (point.symbol === 'none') {
                point.show = false;
                point.labelDiv.show = false;
            }
            // draw the symbol at the point
            var pointSymbol = group.select('.' + point.viewObjectClass);
            pointSymbol.attr({
                'class': point.classAndVisibility(),
                'd': d3.svg.symbol().type(point.symbol).size(point.size),
                'transform': view.translateByCoordinates(point.coordinates)
            });
            if (draggable) {
                point.xDragDelta = 0;
                point.yDragDelta = 0;
                return point.setDragBehavior(view, pointSymbol);
            }
            else {
                return view;
            }
            return view;
        };
        return Point;
    })(KineticGraphs.ViewObject);
    KineticGraphs.Point = Point;
})(KineticGraphs || (KineticGraphs = {}));
/// <reference path="../kg.ts"/>
'use strict';
var KineticGraphs;
(function (KineticGraphs) {
    var GraphDiv = (function (_super) {
        __extends(GraphDiv, _super);
        function GraphDiv(definition) {
            definition = _.defaults(definition, {
                coordinates: { x: 0, y: 0 },
                dimensions: { width: 100, height: 20 },
                math: false,
                align: 'center',
                label: ''
            });
            _super.call(this, definition);
        }
        GraphDiv.prototype.render = function (view) {
            var divObj = this;
            var x = view.margins.left + view.xAxis.scale(divObj.coordinates.x), y = view.margins.top + view.yAxis.scale(divObj.coordinates.y), width = divObj.dimensions.width, height = divObj.dimensions.height, label = divObj.label, draggable = (divObj.hasOwnProperty('xDragParam') || divObj.hasOwnProperty('yDragParam'));
            var div = view.getDiv(this.name);
            div.style('cursor', 'default').style('text-align', 'center').style('color', 'gray').style('position', 'absolute').style('width', width + 'px').style('height', height + 'px').style('line-height', height + 'px');
            // Set left pixel margin; default to centered on x coordinate
            var alignDelta = width * 0.5;
            if (divObj.align == 'left') {
                alignDelta = 0;
            }
            else if (this.align == 'right') {
                // move left by half the width of the div if right aligned
                alignDelta = width;
            }
            div.style('left', (x - alignDelta) + 'px');
            // Set top pixel margin; default to centered on y coordinate
            var vAlignDelta = height * 0.5;
            // Default to centered on x coordinate
            if (this.valign == 'top') {
                vAlignDelta = 0;
            }
            else if (this.align == 'bottom') {
                vAlignDelta = height;
            }
            div.style('top', (y - vAlignDelta) + 'px');
            katex.render(label, div[0][0]);
            if (draggable) {
                divObj.xDragDelta = -view.margins.left;
                divObj.yDragDelta = view.dimensions.height - vAlignDelta;
                return divObj.setDragBehavior(view, div);
            }
            else {
                return view;
            }
        };
        return GraphDiv;
    })(KineticGraphs.ViewObject);
    KineticGraphs.GraphDiv = GraphDiv;
})(KineticGraphs || (KineticGraphs = {}));
/// <reference path="../kg.ts"/>
'use strict';
var KineticGraphs;
(function (KineticGraphs) {
    var LinePlot = (function (_super) {
        __extends(LinePlot, _super);
        function LinePlot(definition) {
            definition = _.defaults(definition, { data: [], interpolation: 'linear' });
            _super.call(this, definition);
        }
        LinePlot.prototype.render = function (graph) {
            // constants TODO should these be defined somewhere else?
            var DATA_PATH_CLASS = 'dataPath';
            var dataCoordinates = graph.dataCoordinates(this.data);
            function init(newGroup) {
                newGroup.append('path').attr('class', DATA_PATH_CLASS);
                return newGroup;
            }
            var group = graph.objectGroup(this.name, init);
            var dataLine = d3.svg.line().interpolate(this.interpolation).x(function (d) {
                return d.x;
            }).y(function (d) {
                return d.y;
            });
            var dataPath = group.select('.' + DATA_PATH_CLASS);
            dataPath.attr({
                'class': this.classAndVisibility() + ' ' + DATA_PATH_CLASS,
                'd': dataLine(dataCoordinates)
            });
            return graph;
        };
        return LinePlot;
    })(KineticGraphs.ViewObject);
    KineticGraphs.LinePlot = LinePlot;
})(KineticGraphs || (KineticGraphs = {}));
/// <reference path="../kg.ts"/>
'use strict';
var KineticGraphs;
(function (KineticGraphs) {
    var PathFamily = (function (_super) {
        __extends(PathFamily, _super);
        function PathFamily(definition) {
            definition = _.defaults(definition, {
                data: [],
                interpolation: 'basis'
            });
            _super.call(this, definition);
        }
        PathFamily.prototype.render = function (graph) {
            // constants TODO should these be defined somewhere else?
            var DATA_PATH_FAMILY_CLASS = 'dataPathFamily';
            function init(newGroup) {
                newGroup.append('g').attr('class', DATA_PATH_FAMILY_CLASS);
                return newGroup;
            }
            var group = graph.objectGroup(this.name, init);
            var dataLine = d3.svg.line().interpolate(this.interpolation).x(function (d) {
                return graph.xAxis.scale(d.x);
            }).y(function (d) {
                return graph.yAxis.scale(d.y);
            });
            var dataPaths = group.select('.' + DATA_PATH_FAMILY_CLASS).selectAll('path').data(this.data);
            dataPaths.enter().append('path');
            dataPaths.attr({
                'd': function (d) {
                    return dataLine(d);
                }
            });
            dataPaths.exit().remove();
            return graph;
        };
        return PathFamily;
    })(KineticGraphs.ViewObject);
    KineticGraphs.PathFamily = PathFamily;
})(KineticGraphs || (KineticGraphs = {}));
/// <reference path='kg.ts'/>
'use strict';
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
                view.updateParams = function (params) {
                    scope.updateParams(params);
                };
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
            view.dimensions.height = Math.min(view.dimensions.height, window.innerHeight - element.offsetTop);
            var frameTranslation = KineticGraphs.positionByPixelCoordinates({ x: 0, y: 0 });
            var visTranslation = KineticGraphs.translateByPixelCoordinates({ x: view.margins.left, y: view.margins.top });
            d3.select(element).select('div').remove();
            // Create new div element to contain SVG
            var frame = d3.select(element).append('div').attr({ style: frameTranslation });
            // Create new SVG element for the view visualization
            var svg = frame.append('svg').attr('width', view.dimensions.width).attr('height', view.dimensions.height);
            // Add a div above the SVG for labels and controls
            view.divs = frame.append('div').attr({ style: visTranslation });
            // Establish SVG groups for visualization area (vis), mask, axes
            view.masked = svg.append('g').attr('transform', visTranslation);
            var mask = svg.append('g').attr('class', 'mask');
            view.unmasked = svg.append('g').attr('transform', visTranslation);
            // Put mask around vis to clip objects that extend beyond the desired viewable area
            mask.append('rect').attr({ x: 0, y: 0, width: view.dimensions.width, height: view.margins.top });
            mask.append('rect').attr({ x: 0, y: view.dimensions.height - view.margins.bottom, width: view.dimensions.width, height: view.margins.bottom });
            mask.append('rect').attr({ x: 0, y: 0, width: view.margins.left, height: view.dimensions.height });
            mask.append('rect').attr({ x: view.dimensions.width - view.margins.right, y: 0, width: view.margins.right, height: view.dimensions.height });
            if (view.xAxis || view.yAxis) {
                // Establish SVG group for axes
                var axes = svg.append('g').attr('class', 'axes').attr('transform', visTranslation);
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
                object.createSubObjects(view);
            });
            view.objects.forEach(function (object) {
                object.update(scope).render(view);
            });
            return view;
        };
        View.prototype.addObject = function (newObj) {
            this.objects.push(newObj);
        };
        View.prototype.updateParams = function (params) {
            console.log('updateParams called before scope applied');
        };
        View.prototype.objectGroup = function (name, init, unmasked) {
            var layer = unmasked ? this.unmasked : this.masked;
            var group = layer.select('#' + name);
            if (group.empty()) {
                group = layer.append('g').attr('id', name);
                group = init(group);
            }
            return group;
        };
        View.prototype.getDiv = function (name) {
            var selection = this.divs.select('#' + name);
            if (selection.empty()) {
                selection = this.divs.append('div').attr('id', name);
            }
            return selection;
        };
        View.prototype.xOnGraph = function (x) {
            return this.xAxis.domain.contains(x);
        };
        View.prototype.yOnGraph = function (y) {
            return this.yAxis.domain.contains(y);
        };
        View.prototype.drag = function (xParam, yParam, xDelta, yDelta) {
            var view = this;
            var xAxis = view.xAxis;
            var yAxis = view.yAxis;
            return d3.behavior.drag().on('drag', function () {
                d3.event.sourceEvent.preventDefault();
                console.log('dragging');
                var dragUpdate = {}, newX, newY;
                if (xParam !== null) {
                    newX = xAxis.scale.invert(d3.event.x + xDelta);
                    if (newX < xAxis.domain.min) {
                        dragUpdate[xParam] = xAxis.domain.min;
                    }
                    else if (newX > xAxis.domain.max) {
                        dragUpdate[xParam] = xAxis.domain.max;
                    }
                    else {
                        dragUpdate[xParam] = newX;
                    }
                }
                if (yParam !== null) {
                    newY = yAxis.scale.invert(d3.event.y + yDelta);
                    if (newY < yAxis.domain.min) {
                        dragUpdate[yParam] = yAxis.domain.min;
                    }
                    else if (newY > xAxis.domain.max) {
                        dragUpdate[yParam] = yAxis.domain.max;
                    }
                    else {
                        dragUpdate[yParam] = newY;
                    }
                }
                view.updateParams(dragUpdate);
            });
        };
        return View;
    })(KineticGraphs.Model);
    KineticGraphs.View = View;
})(KineticGraphs || (KineticGraphs = {}));
/// <reference path="../kg.ts" />
'use strict';
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
'use strict';
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
        }
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
'use strict';
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
            $scope.updateParams = function (params) {
                console.log(JSON.stringify(params));
                $scope.params = _.defaults(params, $scope.params);
                $scope.$apply();
            };
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
                                y: 5,
                                xDragParam: 'x'
                            }
                        },
                        point2: {
                            type: 'Sample.SinglePoint',
                            definition: {
                                name: 'p2',
                                x: 'params.x',
                                y: 'params.y',
                                xDragParam: 'x',
                                yDragParam: 'y',
                                size: 300,
                                label: 'A'
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
                            objects: ['model.point1.point()', 'model.point2.point()']
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
'use strict';
var Sample;
(function (Sample) {
    var SinglePoint = (function (_super) {
        __extends(SinglePoint, _super);
        function SinglePoint(definition) {
            _super.call(this, definition);
            this.p = new KineticGraphs.Point({
                name: definition.name + 'point',
                coordinates: { x: definition.x, y: definition.y },
                size: definition.size,
                symbol: definition.symbol,
                xDragParam: definition.xDragParam,
                yDragParam: definition.yDragParam,
                label: definition.label
            });
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
/// <reference path="viewObjects/label.ts"/>
/// <reference path="viewObjects/linePlot.ts"/>
/// <reference path="viewObjects/pathFamily.ts"/>
/// <reference path="view.ts" />
/// <reference path="views/axis.ts" />
/// <reference path="views/graph.ts" />
/// <reference path="controller.ts" />
/// <reference path="sample/sample.ts" />
'use strict';
angular.module('KineticGraphs', []).controller('KineticGraphCtrl', KineticGraphs.Controller);
//# sourceMappingURL=kinetic-graphs.js.map