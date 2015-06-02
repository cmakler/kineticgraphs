/// <reference path="kg.ts"/>
'use strict';
var KG;
(function (KG) {
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
    KG.Domain = Domain;
    function translateByPixelCoordinates(coordinates) {
        return 'translate(' + coordinates.x + ',' + coordinates.y + ')';
    }
    KG.translateByPixelCoordinates = translateByPixelCoordinates;
    function positionByPixelCoordinates(coordinates, dimension) {
        var style = 'position:relative; left: ' + coordinates.x + 'px; top: ' + coordinates.y + 'px;';
        if (dimension) {
            if (dimension.hasOwnProperty('width')) {
                style += ' width: ' + dimension.width + 'px;';
            }
        }
        return style;
    }
    KG.positionByPixelCoordinates = positionByPixelCoordinates;
    function getCoordinates(def) {
        var defaultCoordinates = { x: 0, y: 0 };
        if (!def || def == undefined) {
            return defaultCoordinates;
        }
        if (def.hasOwnProperty('coordinates')) {
            return def.coordinates;
        }
        else if (def.hasOwnProperty('x') && def.hasOwnProperty('y')) {
            return def;
        }
        else if (def.hasOwnProperty('definition')) {
            return getCoordinates(def.definition);
        }
        else {
            return defaultCoordinates;
        }
    }
    KG.getCoordinates = getCoordinates;
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
    KG.createInstance = createInstance;
})(KG || (KG = {}));
'use strict';
var KG;
(function (KG) {
    var Model = (function () {
        function Model(definition) {
            this.definition = definition;
            var model = this;
            for (var key in definition) {
                if (definition.hasOwnProperty(key) && definition[key] != undefined) {
                    var value = definition[key];
                    if (value.hasOwnProperty('type') && value.hasOwnProperty('definition')) {
                        model[key] = KG.createInstance(value);
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
                        if (obj[key] instanceof KG.Model) {
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
            // Do any model-specific updating
            model = model._update(scope);
            if (callback) {
                callback();
            }
            return model;
        };
        Model.prototype._update = function (scope) {
            return this; // overridden by child classes
        };
        return Model;
    })();
    KG.Model = Model;
})(KG || (KG = {}));
'use strict';
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var KG;
(function (KG) {
    var Restriction = (function (_super) {
        __extends(Restriction, _super);
        function Restriction(definition) {
            _super.call(this, definition);
        }
        Restriction.prototype.validate = function (params) {
            var RANGE_TYPE = "range";
            var SET_TYPE = "set";
            var BOOLEAN_TYPE = "boolean";
            var r = this;
            function isSimpleParam(name) {
                return name === name.match(/params\.[a-zA-Z0-9]+/)[0];
            }
            function paramName(name) {
                return name.split('params.')[1];
            }
            if (r.restrictionType === RANGE_TYPE) {
                if (r.min > r.max) {
                    var maxName = r.definition['max'];
                    if (isSimpleParam(maxName)) {
                        params[paramName(maxName)] = r.min;
                        return params;
                    }
                    var minName = r.definition['min'];
                    if (isSimpleParam(minName)) {
                        params[paramName(minName)] = r.max;
                        return params;
                    }
                    return false;
                }
                var e = r.definition['expression'];
                if (isSimpleParam(e)) {
                    var param = paramName(e);
                    var value = this.round();
                    if (value < r.min) {
                        params[param] = r.min;
                    }
                    else if (value > r.max) {
                        params[param] = r.max;
                    }
                    else {
                        params[param] = value;
                    }
                    return params;
                }
                else if (r.min <= r.expression && r.expression <= r.max) {
                    return params;
                }
                else {
                    return false;
                }
            }
            if (r.restrictionType === SET_TYPE) {
                if (r.set.indexOf(r.expression) > -1) {
                    return params;
                }
                else {
                    return false;
                }
            }
            if (r.restrictionType === BOOLEAN_TYPE) {
                if (r.expression) {
                    return params;
                }
                else {
                    return false;
                }
            }
        };
        Restriction.prototype.round = function () {
            var r = this;
            if (r.precision > 0) {
                var delta = r.expression - r.min;
                var steps = Math.round(delta / r.precision);
                return r.min + (steps * r.precision);
            }
            else {
                return r.expression;
            }
        };
        return Restriction;
    })(KG.Model);
    KG.Restriction = Restriction;
})(KG || (KG = {}));
/// <reference path="../kg.ts"/>
'use strict';
var KG;
(function (KG) {
    var ViewObject = (function (_super) {
        __extends(ViewObject, _super);
        function ViewObject(definition) {
            definition = _.defaults(definition, { className: '', show: true, xDrag: false, yDrag: false });
            _super.call(this, definition);
            this.xDragDelta = 0;
            this.yDragDelta = 0;
            this.xDragParam = definition.xDrag ? definition.coordinates.x.replace('params.', '') : null;
            this.yDragParam = definition.yDrag ? definition.coordinates.y.replace('params.', '') : null;
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
            obj.style('cursor', viewObj.xDrag ? (viewObj.yDrag ? 'move' : 'ew-resize') : 'ns-resize');
            obj.call(view.drag(viewObj.xDragParam, viewObj.yDragParam, viewObj.xDragDelta, viewObj.yDragDelta));
            return view;
        };
        return ViewObject;
    })(KG.Model);
    KG.ViewObject = ViewObject;
})(KG || (KG = {}));
/// <reference path="../kg.ts"/>
'use strict';
var KG;
(function (KG) {
    var Point = (function (_super) {
        __extends(Point, _super);
        function Point(definition) {
            definition = _.defaults(definition, { coordinates: { x: 0, y: 0 }, size: 100, symbol: 'circle' });
            _super.call(this, definition);
            if (definition.label) {
                this.labelDiv = new KG.GraphDiv(definition);
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
            var point = this, draggable = (point.xDrag || point.yDrag);
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
                return point.setDragBehavior(view, pointSymbol);
            }
            else {
                return view;
            }
            return view;
        };
        return Point;
    })(KG.ViewObject);
    KG.Point = Point;
})(KG || (KG = {}));
/// <reference path="../kg.ts"/>
'use strict';
var KG;
(function (KG) {
    var Segment = (function (_super) {
        __extends(Segment, _super);
        function Segment(definition) {
            definition.a = KG.getCoordinates(definition.a);
            definition.b = KG.getCoordinates(definition.b);
            _super.call(this, definition);
            if (definition.label) {
                var labelDefinition = _.clone(definition);
                labelDefinition.coordinates = {
                    x: 0.5 * (definition.a.x + definition.b.x),
                    y: 0.5 * (definition.a.y + definition.b.y)
                };
                this.labelDiv = new KG.GraphDiv(labelDefinition);
            }
            this.viewObjectSVGtype = 'path';
            this.viewObjectClass = 'segment';
        }
        Segment.prototype.render = function (view) {
            var segment = this;
            var group = view.objectGroup(segment.name, segment.initGroupFn(), false);
            var dataLine = d3.svg.line().x(function (d) {
                return view.xAxis.scale(d.x);
            }).y(function (d) {
                return view.yAxis.scale(d.y);
            });
            var segmentSelection = group.select('.' + segment.viewObjectClass);
            segmentSelection.attr({
                'class': segment.classAndVisibility(),
                'd': dataLine([segment.a, segment.b])
            });
            return view;
        };
        return Segment;
    })(KG.ViewObject);
    KG.Segment = Segment;
})(KG || (KG = {}));
/// <reference path="../kg.ts"/>
'use strict';
var KG;
(function (KG) {
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
            var x = view.margins.left + view.xAxis.scale(divObj.coordinates.x), y = view.margins.top + view.yAxis.scale(divObj.coordinates.y), width = divObj.dimensions.width, height = divObj.dimensions.height, label = divObj.label, draggable = (divObj.xDrag || divObj.yDrag);
            var div = view.getDiv(this.name);
            div.style('cursor', 'default').style('text-align', 'center').style('color', 'white').style('position', 'absolute').style('width', width + 'px').style('height', height + 'px').style('line-height', height + 'px');
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
            katex.render(label.toString(), div[0][0]);
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
    })(KG.ViewObject);
    KG.GraphDiv = GraphDiv;
})(KG || (KG = {}));
/// <reference path="../kg.ts"/>
'use strict';
var KG;
(function (KG) {
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
    })(KG.ViewObject);
    KG.LinePlot = LinePlot;
})(KG || (KG = {}));
/// <reference path="../kg.ts"/>
'use strict';
var KG;
(function (KG) {
    var PathFamily = (function (_super) {
        __extends(PathFamily, _super);
        function PathFamily(definition) {
            definition = _.defaults(definition, {
                data: [],
                interpolation: 'basis'
            });
            _super.call(this, definition);
            this.viewObjectSVGtype = 'g';
            this.viewObjectClass = 'dataPathFamily';
        }
        PathFamily.prototype.render = function (view) {
            var pathFamily = this;
            var group = view.objectGroup(pathFamily.name, pathFamily.initGroupFn(), false);
            var dataLine = d3.svg.line().interpolate(this.interpolation).x(function (d) {
                return view.xAxis.scale(d.x);
            }).y(function (d) {
                return view.yAxis.scale(d.y);
            });
            var dataPaths = group.select('.' + pathFamily.viewObjectClass).selectAll('path').data(this.data);
            dataPaths.enter().append('path');
            dataPaths.attr({
                'd': function (d) {
                    return dataLine(d);
                },
                'class': this.classAndVisibility()
            });
            dataPaths.exit().remove();
            return view;
        };
        return PathFamily;
    })(KG.ViewObject);
    KG.PathFamily = PathFamily;
})(KG || (KG = {}));
/// <reference path='kg.ts'/>
'use strict';
var KG;
(function (KG) {
    var View = (function (_super) {
        __extends(View, _super);
        function View(definition) {
            definition = _.defaults(definition, { background: 'white', mask: true });
            _super.call(this, definition);
            if (definition.hasOwnProperty('xAxis')) {
                this.xAxis = new KG.XAxis(definition.xAxis);
            }
            if (definition.hasOwnProperty('yAxis')) {
                this.yAxis = new KG.YAxis(definition.yAxis);
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
            // Establish dimensions of the view
            var element = $('#' + view.element_id)[0];
            view.dimensions.width = Math.min(view.dimensions.width, element.clientWidth);
            view.dimensions.height = Math.min(view.dimensions.height, window.innerHeight - element.offsetTop);
            var frameTranslation = KG.positionByPixelCoordinates({ x: (element.clientWidth - view.dimensions.width) / 2, y: 0 });
            var visTranslation = KG.translateByPixelCoordinates({ x: view.margins.left, y: view.margins.top });
            d3.select(element).select('div').remove();
            // Create new div element to contain SVG
            var frame = d3.select(element).append('div').attr({ style: frameTranslation });
            // Create new SVG element for the view visualization
            var svg = frame.append('svg').attr('width', view.dimensions.width).attr('height', view.dimensions.height);
            // Add a div above the SVG for labels and controls
            view.divs = frame.append('div').attr({ style: visTranslation });
            if (view.mask) {
                // Establish SVG groups for visualization area (vis), mask, axes
                view.masked = svg.append('g').attr('transform', visTranslation);
                var mask = svg.append('g').attr('class', 'mask');
                // Put mask around vis to clip objects that extend beyond the desired viewable area
                mask.append('rect').attr({ x: 0, y: 0, width: view.dimensions.width, height: view.margins.top, fill: view.background });
                mask.append('rect').attr({ x: 0, y: view.dimensions.height - view.margins.bottom, width: view.dimensions.width, height: view.margins.bottom, fill: view.background });
                mask.append('rect').attr({ x: 0, y: 0, width: view.margins.left, height: view.dimensions.height, fill: view.background });
                mask.append('rect').attr({ x: view.dimensions.width - view.margins.right, y: 0, width: view.margins.right, height: view.dimensions.height, fill: view.background });
            }
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
            // Establish SVG group for objects that lie above the axes (e.g., points and labels)
            view.unmasked = svg.append('g').attr('transform', visTranslation);
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
    })(KG.Model);
    KG.View = View;
})(KG || (KG = {}));
/// <reference path="../kg.ts" />
'use strict';
var KG;
(function (KG) {
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
            this.domain = new KG.Domain(definition.min, definition.max);
        }
        Axis.prototype.draw = function (vis, graph_definition) {
            // overridden by child class
        };
        Axis.prototype.scaleFunction = function (pixelLength, domain) {
            return d3.scale.linear(); // overridden by child class
        };
        return Axis;
    })(KG.Model);
    KG.Axis = Axis;
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
    KG.XAxis = XAxis;
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
    KG.YAxis = YAxis;
})(KG || (KG = {}));
/// <reference path="../kg.ts"/>
'use strict';
var KG;
(function (KG) {
    var Graph = (function (_super) {
        __extends(Graph, _super);
        function Graph(definition) {
            // ensure dimensions and margins are set; set any missing elements to defaults
            definition.dimensions = _.defaults(definition.dimensions || {}, { width: 500, height: 500 });
            definition.margins = _.defaults(definition.margins || {}, { top: 20, left: 100, bottom: 100, right: 20 });
            _super.call(this, definition);
            this.xAxis = new KG.XAxis(definition.xAxis);
            this.yAxis = new KG.YAxis(definition.yAxis);
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
            return KG.translateByPixelCoordinates(this.pixelCoordinates(coordinates));
        };
        Graph.prototype.positionByCoordinates = function (coordinates, dimension) {
            return KG.positionByPixelCoordinates(this.pixelCoordinates(coordinates), dimension);
        };
        // Convert model coordinates to pixel coordinates for an array of points
        Graph.prototype.dataCoordinates = function (coordinateArray) {
            var graph = this;
            return coordinateArray.map(graph.pixelCoordinates, graph);
        };
        return Graph;
    })(KG.View);
    KG.Graph = Graph;
})(KG || (KG = {}));
/// <reference path="../kg.ts"/>
'use strict';
var KG;
(function (KG) {
    var Slider = (function (_super) {
        __extends(Slider, _super);
        function Slider(definition) {
            definition.dimensions = _.defaults(definition.dimensions || {}, { width: 300, height: 50 });
            definition.margins = _.defaults(definition.margins || {}, { top: 25, left: 25, bottom: 25, right: 25 });
            definition.mask = false;
            _super.call(this, definition);
            this.xAxis = new KG.XAxis(definition.axis);
            this.objects = [
                new SliderControl({ name: definition.element_id + 'Ctrl', param: 'params.' + definition.param })
            ];
        }
        Slider.prototype._update = function (scope) {
            this.xAxis.update(scope);
            return this;
        };
        return Slider;
    })(KG.View);
    KG.Slider = Slider;
    var SliderControl = (function (_super) {
        __extends(SliderControl, _super);
        function SliderControl(definition) {
            definition.xDrag = true;
            definition.yDrag = false;
            definition.coordinates = { x: definition.param, y: 0 };
            _super.call(this, definition);
            this.viewObjectSVGtype = 'circle';
            this.viewObjectClass = 'sliderControl';
        }
        SliderControl.prototype.render = function (view) {
            var control = this;
            var group = view.objectGroup(control.name, control.initGroupFn(), true);
            var controlCircle = group.select('.' + control.viewObjectClass);
            controlCircle.attr({
                'class': control.classAndVisibility(),
                'r': view.dimensions.height / 3,
                'cx': view.xAxis.scale(control.param),
                'cy': 0
            });
            return control.setDragBehavior(view, controlCircle);
        };
        return SliderControl;
    })(KG.ViewObject);
    KG.SliderControl = SliderControl;
})(KG || (KG = {}));
/// <reference path="kg.ts" />
'use strict';
var KG;
(function (KG) {
    var Controller = (function () {
        function Controller($scope, $window) {
            this.$scope = $scope;
            $scope.init = function (definition) {
                $scope.params = definition.params;
                $scope.restrictions = definition.restrictions.map(function (restrictionDefinition) {
                    return new KG.Restriction(restrictionDefinition);
                });
                $scope.model = KG.createInstance(definition.model);
                $scope.model.update($scope, function () {
                    $scope.views = definition.views.map(function (view) {
                        return KG.createInstance(view);
                    });
                });
            };
            $scope.renderMath = function () {
                var mathElements = $('.math');
                for (var i = 0; i < mathElements.length; i++) {
                    var element = mathElements[i];
                    if (!element.hasAttribute('raw')) {
                        element.setAttribute('raw', element.textContent);
                    }
                    katex.render(element.getAttribute('raw'), element);
                }
            };
            // Updates and redraws interactive objects (graphs and sliders) when a parameter changes
            function render(redraw) {
                $scope.model.update($scope, function () {
                    $scope.views.forEach(function (view) {
                        view.render($scope, redraw);
                    });
                    $scope.renderMath();
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
                var oldParams = _.clone($scope.params);
                $scope.params = _.defaults(params, $scope.params);
                $scope.$apply();
                var validChange = true;
                $scope.restrictions.forEach(function (r) {
                    r.update($scope, null);
                    var validParams = r.validate($scope.params);
                    if (validParams == false) {
                        validChange = false;
                        $scope.error = r.error;
                    }
                    else {
                        $scope.params = validParams;
                        $scope.$apply();
                        $scope.error = '';
                    }
                });
                if (!validChange) {
                    $scope.params = oldParams;
                    $scope.$apply();
                }
            };
            $scope.init({
                params: {
                    mean1: 0.2,
                    stDev1: 0.3,
                    mean2: 0.3,
                    stDev2: 0.4,
                    mean3: 0.4,
                    stDev3: 0.5,
                    rho12: 0,
                    rho23: 0,
                    rho13: 0,
                    maxLeverage: 0,
                    riskFreeReturn: 0.05
                },
                restrictions: [
                    {
                        expression: 'params.maxLeverage',
                        restrictionType: 'range',
                        max: 100,
                        min: 0,
                        precision: 10
                    },
                    {
                        expression: 'params.rho12',
                        restrictionType: 'range',
                        max: 1,
                        min: -1,
                        precision: 0.1
                    },
                    {
                        expression: 'params.rho23',
                        restrictionType: 'range',
                        max: 1,
                        min: -1,
                        precision: 0.1
                    },
                    {
                        expression: 'params.rho13',
                        restrictionType: 'range',
                        max: 1,
                        min: -1,
                        precision: 0.1
                    },
                    {
                        expression: 'params.riskFreeReturn',
                        restrictionType: 'range',
                        max: 0.2,
                        min: 0,
                        error: "'risk free return should be between 0 and 0.2'"
                    },
                    {
                        expression: 'model.positiveDefinite',
                        restrictionType: 'boolean',
                        error: "'would make matrix not positive definite'"
                    }
                ],
                model: {
                    type: 'FinanceGraphs.Portfolio',
                    definition: {}
                },
                views: [
                    {
                        type: 'KG.Graph',
                        definition: {
                            element_id: 'graph',
                            dimensions: { width: 700, height: 700 },
                            xAxis: { min: 0, max: 1, title: '"Standard Deviation"' },
                            yAxis: { min: 0, max: 0.5, title: '"Mean"' },
                            objects: ['model.optimalPortfolio', 'model.asset1.point', 'model.asset2.point', 'model.asset3.point', 'model.riskFreeAsset', 'model.riskReturnLine', 'model.threeAssetPortfolios', 'model.twoAssetPortfolios']
                        }
                    },
                    {
                        type: 'KG.Slider',
                        definition: {
                            element_id: 'leverageSlider',
                            param: 'maxLeverage',
                            axis: { min: 0, max: 100, tickValues: [0, 50, 100] }
                        }
                    },
                    {
                        type: 'KG.Slider',
                        definition: {
                            element_id: 'slider12',
                            param: 'rho12',
                            precision: '0.1',
                            axis: { min: -1, max: 1, tickValues: [-1, 0, 1] }
                        }
                    },
                    {
                        type: 'KG.Slider',
                        definition: {
                            element_id: 'slider23',
                            param: 'rho23',
                            axis: { min: -1, max: 1, tickValues: [-1, 0, 1] }
                        }
                    },
                    {
                        type: 'KG.Slider',
                        definition: {
                            element_id: 'slider13',
                            param: 'rho13',
                            axis: { min: -1, max: 1, tickValues: [-1, 0, 1] }
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
    KG.Controller = Controller;
})(KG || (KG = {}));
'use strict';
var Sample;
(function (Sample) {
    var SinglePoint = (function (_super) {
        __extends(SinglePoint, _super);
        function SinglePoint(definition) {
            _super.call(this, definition);
            this.point = new KG.Point({
                name: definition.name + 'point',
                coordinates: { x: definition.x, y: definition.y },
                size: definition.size,
                symbol: definition.symbol,
                xDrag: definition.xDrag,
                yDrag: definition.yDrag,
                label: definition.label
            });
        }
        return SinglePoint;
    })(KG.Model);
    Sample.SinglePoint = SinglePoint;
    var TwoPoints = (function (_super) {
        __extends(TwoPoints, _super);
        function TwoPoints(definition) {
            _super.call(this, definition);
            this.s = new KG.Segment({
                name: 'twoPointSegment',
                a: definition.point1,
                b: definition.point2
            });
        }
        TwoPoints.prototype.segment = function () {
            return this.s;
        };
        return TwoPoints;
    })(KG.Model);
    Sample.TwoPoints = TwoPoints;
})(Sample || (Sample = {}));
/// <reference path="../fg.ts"/>
'use strict';
var FinanceGraphs;
(function (FinanceGraphs) {
    var Asset = (function (_super) {
        __extends(Asset, _super);
        function Asset(definition) {
            _super.call(this, definition);
            this.point = new KG.Point({
                name: definition.name + 'point',
                coordinates: { x: definition.stDev, y: definition.mean },
                size: 500,
                xDrag: true,
                yDrag: true,
                label: definition.name
            });
        }
        return Asset;
    })(KG.Model);
    FinanceGraphs.Asset = Asset;
})(FinanceGraphs || (FinanceGraphs = {}));
/// <reference path="../fg.ts"/>
'use strict';
var FinanceGraphs;
(function (FinanceGraphs) {
    var Portfolio = (function (_super) {
        __extends(Portfolio, _super);
        function Portfolio(definition) {
            ['rho12', 'rho13', 'rho23', 'maxLeverage', 'riskFreeReturn'].forEach(function (name) {
                definition[name] = 'params.' + name;
            });
            definition.asset1 = {
                type: 'FinanceGraphs.Asset',
                definition: {
                    name: 'A_1',
                    mean: 'params.mean1',
                    stDev: 'params.stDev1'
                }
            };
            definition.asset2 = {
                type: 'FinanceGraphs.Asset',
                definition: {
                    name: 'A_2',
                    mean: 'params.mean2',
                    stDev: 'params.stDev2'
                }
            };
            definition.asset3 = {
                type: 'FinanceGraphs.Asset',
                definition: {
                    name: 'A_3',
                    mean: 'params.mean3',
                    stDev: 'params.stDev3'
                }
            };
            _super.call(this, definition);
            var p = this;
            p.assets = [p.asset1, p.asset2, p.asset3];
            p.threeAssetPortfolios = new KG.PathFamily({
                name: 'threeAssetData',
                data: 'model.threeAssetData',
                interpolation: 'basis'
            });
            p.twoAssetPortfolios = new KG.PathFamily({
                name: 'twoAssetData',
                className: 'draw',
                data: 'model.twoAssetData',
                interpolation: 'basis'
            });
            p.riskFreeAsset = new KG.Point({
                name: 'riskFreeAsset',
                coordinates: { x: 0, y: 'params.riskFreeReturn' },
                size: 500,
                xDrag: false,
                yDrag: true,
                label: 'RF'
            });
            p.optimalPortfolio = new KG.Point({
                name: 'optimalPortfolio',
                coordinates: { x: 'params.optimalPortfolioStDev', y: 'params.optimalPortfolioMean' },
                size: 500,
                xDrag: false,
                yDrag: false,
                label: 'P'
            });
            p.riskReturnLine = new KG.Segment({
                name: 'twoPointSegment',
                a: p.riskFreeAsset,
                b: p.optimalPortfolio
            });
            p.optimalPortfolioMean = 0;
            p.optimalPortfolioStDev = 0.5;
            p.riskReturnSlope = 0;
        }
        Portfolio.prototype._update = function (scope) {
            var p = this;
            function correlation(i, j) {
                if (i == j) {
                    return 1;
                }
                else if (i > j) {
                    return correlation(j, i);
                }
                else {
                    return p['rho' + (i + 1) + (j + 1)];
                }
            }
            function calculateCorrelationMatrix() {
                var matrix = [];
                for (var i = 0; i < p.assets.length; i++) {
                    var matrixRow = [];
                    for (var j = 0; j < p.assets.length; j++) {
                        matrixRow.push(correlation(i, j));
                    }
                    matrix.push(matrixRow);
                }
                p.correlationMatrix = matrix;
                return matrix;
            }
            function calculateCovarianceMatrix() {
                var matrix = calculateCorrelationMatrix().map(function (correlationMatrixRow, i) {
                    return correlationMatrixRow.map(function (correlationMatrixCell, j) {
                        return correlationMatrixCell * p.stDevArray()[i] * p.stDevArray()[j];
                    });
                });
                p.covarianceMatrix = matrix;
                return matrix;
            }
            function checkPositiveDefinite() {
                p.positiveDefinite = true;
                var eigenvalues = numeric.eig(calculateCovarianceMatrix()).lambda.x;
                eigenvalues.forEach(function (e) {
                    if (e < 0) {
                        p.positiveDefinite = false;
                    }
                });
                return p.positiveDefinite;
            }
            if (checkPositiveDefinite()) {
                p.twoAssetData = p.data2();
                p.threeAssetData = p.data3();
                if (p.optimalPortfolio != undefined) {
                    scope.params.optimalPortfolioMean = p.optimalPortfolioMean;
                    scope.params.optimalPortfolioStDev = p.optimalPortfolioStDev;
                }
            }
            return p;
        };
        Portfolio.prototype.meanArray = function () {
            return this.assets.map(function (asset) {
                return asset.mean;
            });
        };
        Portfolio.prototype.stDevArray = function () {
            return this.assets.map(function (asset) {
                return asset.stDev;
            });
        };
        Portfolio.prototype.mean = function (weightArray) {
            return numeric.dot(this.meanArray(), weightArray);
        };
        Portfolio.prototype.stDev = function (weightArray) {
            var variance = numeric.dot(weightArray, numeric.dot(this.covarianceMatrix, weightArray));
            if (variance >= 0) {
                return Math.sqrt(variance);
            }
            else {
                console.log('oops! getting a negative variance with weights ', weightArray[0], ',', weightArray[1], ',', weightArray[2], '!');
                return 0;
            }
        };
        // Generate dataset of portfolio means and variances for various weights of two assets
        Portfolio.prototype.data2 = function () {
            var portfolio = this, maxLeverage = portfolio.maxLeverage, d = [];
            d.push(portfolio.twoAssetPortfolio(1, 2, [0, 0, 0]));
            d.push(portfolio.twoAssetPortfolio(0, 2, [0, 0, 0]));
            d.push(portfolio.twoAssetPortfolio(0, 1, [0, 0, 0]));
            return d;
        };
        // Generate dataset of portfolio means and variances for various weights of all three assets
        Portfolio.prototype.data3 = function () {
            var portfolio = this, maxLeverage = portfolio.maxLeverage, d = [], w;
            portfolio.riskReturnSlope = 0;
            var min = -maxLeverage * 0.01, max = 1 + maxLeverage * 0.01, dataPoints = 10 + maxLeverage * 0.2;
            for (var i = 0; i < dataPoints + 1; i++) {
                w = min + i * (max - min) / dataPoints;
                d.push(portfolio.twoAssetPortfolio(1, 2, [w, 0, 0]));
                d.push(portfolio.twoAssetPortfolio(0, 2, [0, w, 0]));
                d.push(portfolio.twoAssetPortfolio(0, 1, [0, 0, w]));
            }
            return d;
        };
        // Generate lines representing combinations of two assets
        Portfolio.prototype.twoAssetPortfolio = function (asset1, asset2, weightArray) {
            var portfolio = this, maxLeverage = portfolio.maxLeverage, d = [], otherAssets = 0;
            weightArray.forEach(function (w) {
                otherAssets += w;
            });
            var min = -maxLeverage * 0.01, max = 1 + maxLeverage * 0.01, dataPoints = 2 * (10 + maxLeverage * 0.2);
            var colorScale = d3.scale.linear().domain([0, 1]).range(["red", "blue"]);
            for (var i = 0; i < dataPoints + 1; i++) {
                weightArray[asset1] = min + i * (max - min) / dataPoints;
                weightArray[asset2] = 1 - weightArray[asset1] - otherAssets;
                if (weightArray[asset2] >= min) {
                    var s = portfolio.stDev(weightArray), m = portfolio.mean(weightArray);
                    d.push({
                        x: s,
                        y: m,
                        color: colorScale(weightArray[asset1]),
                        weights: weightArray
                    });
                    if (s > 0) {
                        var slope = (m - portfolio.riskFreeReturn) / s;
                        if (slope > portfolio.riskReturnSlope) {
                            portfolio.optimalPortfolioMean = m;
                            portfolio.optimalPortfolioStDev = s;
                            portfolio.riskReturnSlope = slope;
                            portfolio.optimalPortfolioWeightArray = _.clone(weightArray);
                        }
                    }
                }
            }
            return d;
        };
        return Portfolio;
    })(KG.Model);
    FinanceGraphs.Portfolio = Portfolio;
})(FinanceGraphs || (FinanceGraphs = {}));
/// <reference path="../kg.ts"/>
/// <reference path="capm/asset.ts"/>
/// <reference path="capm/portfolio.ts"/>
/// <reference path="../bower_components/DefinitelyTyped/jquery/jquery.d.ts" />
/// <reference path="../bower_components/DefinitelyTyped/jquery.color/jquery.color.d.ts" />
/// <reference path="../bower_components/DefinitelyTyped/angularjs/angular.d.ts"/>
/// <reference path="../bower_components/DefinitelyTyped/d3/d3.d.ts"/>
/// <reference path="../bower_components/DefinitelyTyped/underscore/underscore.d.ts"/>
/// <reference path="helpers.ts" />
/// <reference path="model.ts" />
/// <reference path="restriction.ts" />
/// <reference path="viewObjects/viewObject.ts"/>
/// <reference path="viewObjects/point.ts"/>
/// <reference path="viewObjects/segment.ts"/>
/// <reference path="viewObjects/label.ts"/>
/// <reference path="viewObjects/linePlot.ts"/>
/// <reference path="viewObjects/pathFamily.ts"/>
/// <reference path="view.ts" />
/// <reference path="views/axis.ts" />
/// <reference path="views/graph.ts" />
/// <reference path="views/slider.ts" />
/// <reference path="controller.ts" />
/// <reference path="sample/sample.ts" />
/// <reference path="finance/fg.ts" />
'use strict';
angular.module('KineticGraphs', []).controller('KineticGraphCtrl', KG.Controller);
//# sourceMappingURL=kinetic-graphs.js.map