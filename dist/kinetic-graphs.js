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
        Domain.prototype.contains = function (x, strict) {
            strict = strict || false;
            var lowEnough = strict ? (this.max > x) : (this.max >= x);
            var highEnough = strict ? (this.min < x) : (this.min <= x);
            return lowEnough && highEnough;
        };
        return Domain;
    })();
    KG.Domain = Domain;
    function areTheSamePoint(a, b) {
        return (a.x === b.x && a.y === b.y);
    }
    KG.areTheSamePoint = areTheSamePoint;
    function areNotTheSamePoint(a, b) {
        return !areTheSamePoint(a, b);
    }
    KG.areNotTheSamePoint = areNotTheSamePoint;
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
    function distanceBetweenCoordinates(a, b) {
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    }
    KG.distanceBetweenCoordinates = distanceBetweenCoordinates;
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
var KGMath;
(function (KGMath) {
    var Functions;
    (function (Functions) {
        var Base = (function (_super) {
            __extends(Base, _super);
            function Base(definition) {
                _super.call(this, definition);
            }
            // Returns y value for given x, for a two-dimensional function
            Base.prototype.yValue = function (x) {
                return 0;
            };
            // Returns x value for given y, for a two-dimensional function
            Base.prototype.xValue = function (y) {
                return 0;
            };
            // Returns the slope between (a,f(a)) and (b,f(b)).
            // If inverse = true, returns the slope between (f(a),a) and (f(b),b).
            // Assumes that a and b are both scalars (for now).
            Base.prototype.slopeBetweenPoints = function (a, b, inverse) {
                var f = this;
                b = b || 0;
                inverse = inverse || false;
                var s = (f.yValue(a) - f.yValue(b)) / (a - b);
                return inverse ? 1 / s : s;
            };
            return Base;
        })(KG.Model);
        Functions.Base = Base;
    })(Functions = KGMath.Functions || (KGMath.Functions = {}));
})(KGMath || (KGMath = {}));
/*
 A linear function is a special polynomial defined either with two points or a point and a slope.
 This function takes either of those and returns a polynomial of the form ax + by + c.
 The params object is of the form: { definitionType: '', param1: foo, param2: bar }
 */
var KGMath;
(function (KGMath) {
    var Functions;
    (function (Functions) {
        var Linear = (function (_super) {
            __extends(Linear, _super);
            function Linear() {
                _super.apply(this, arguments);
                this.linearIntersection = function (otherLine, delta) {
                    var thisLine = this;
                    delta = delta || 0;
                    var a = thisLine.coefficients.a, b = thisLine.coefficients.b, c = thisLine.coefficients.c, oa = otherLine.coefficients.a, ob = otherLine.coefficients.b, oc = otherLine.coefficients.c;
                    var diffLine = new Linear({
                        coefficients: {
                            a: a * ob - b * oa,
                            b: b * ob,
                            c: ob * c - oc * b - delta
                        }
                    }), x = diffLine.xIntercept, y = thisLine.yValue(x);
                    return { x: x, y: y };
                };
            }
            Linear.prototype._update = function (scope) {
                return this.updateLine();
            };
            Linear.prototype.updateLine = function () {
                var l = this;
                var a = l.coefficients.a, b = l.coefficients.b, c = l.coefficients.c;
                l.slope = -a / b;
                l.inverseSlope = -b / a;
                l.isVertical = (b === 0);
                l.isHorizontal = (a === 0);
                l.xIntercept = l.isHorizontal ? null : -c / a;
                l.yIntercept = l.isVertical ? null : -c / b;
                return l;
            };
            Linear.prototype.yValue = function (x) {
                var l = this;
                return l.isVertical ? undefined : l.yIntercept + l.slope * x;
            };
            Linear.prototype.xValue = function (y) {
                var l = this;
                return l.isHorizontal ? undefined : l.xIntercept + l.inverseSlope * y;
            };
            Linear.prototype.viewBoundaryPoints = function (view) {
                var l = this;
                var xDomain = view.xAxis.domain, yDomain = view.yAxis.domain;
                var points = [];
                if (l.isVertical) {
                    points = [{ x: l.xIntercept, y: yDomain.min }, { x: l.xIntercept, y: yDomain.max }];
                }
                else if (l.isHorizontal) {
                    points = [{ x: xDomain.min, y: l.yIntercept }, { x: xDomain.max, y: l.yIntercept }];
                }
                else {
                    var xTop = l.xValue(yDomain.max), xBottom = l.xValue(yDomain.min), yLeft = l.yValue(xDomain.min), yRight = l.yValue(xDomain.max);
                    // add endpoints on the left or right sides, including the corners
                    if (yDomain.contains(yLeft)) {
                        points.push({ x: xDomain.min, y: yLeft });
                    }
                    if (yDomain.contains(yRight)) {
                        points.push({ x: xDomain.max, y: yRight });
                    }
                    // add endpoints on the top or bottom, not including the corners
                    if (xDomain.contains(xBottom, true)) {
                        points.push({ x: xBottom, y: yDomain.min });
                    }
                    if (xDomain.contains(xTop, true)) {
                        points.push({ x: xTop, y: yDomain.max });
                    }
                    // A maximimum of two points should have been added. If not, something is wrong.
                    if (points.length > 2) {
                        console.log('Oh noes! More than two points! Investigate!');
                    }
                }
                return points;
            };
            return Linear;
        })(Functions.Base);
        Functions.Linear = Linear;
        var StandardLine = (function (_super) {
            __extends(StandardLine, _super);
            function StandardLine(definition) {
                _super.call(this, definition);
            }
            return StandardLine;
        })(Linear);
        Functions.StandardLine = StandardLine;
        var SlopeInterceptLine = (function (_super) {
            __extends(SlopeInterceptLine, _super);
            function SlopeInterceptLine(definition) {
                _super.call(this, definition);
            }
            // Given y = m*x + b => m*x + (-1)y + b = 0
            SlopeInterceptLine.prototype._update = function (scope) {
                var l = this;
                l.coefficients = {
                    a: l.m,
                    b: -1,
                    c: l.b
                };
                return l.updateLine();
            };
            return SlopeInterceptLine;
        })(Linear);
        Functions.SlopeInterceptLine = SlopeInterceptLine;
        var PointSlopeLine = (function (_super) {
            __extends(PointSlopeLine, _super);
            function PointSlopeLine(definition) {
                _super.call(this, definition);
            }
            // Given Y - y = slope(X - x) => slope*X - Y + (y - slope*x)
            PointSlopeLine.prototype._update = function (scope) {
                var l = this;
                l.coefficients = {
                    a: l.m,
                    b: -1,
                    c: l.p.y - l.m * l.p.x
                };
                return l.updateLine();
            };
            return PointSlopeLine;
        })(Linear);
        Functions.PointSlopeLine = PointSlopeLine;
        var TwoPointLine = (function (_super) {
            __extends(TwoPointLine, _super);
            function TwoPointLine(definition) {
                _super.call(this, definition);
            }
            //
            TwoPointLine.prototype._update = function (scope) {
                var l = this;
                var x1 = l.p1.x, x2 = l.p2.x, y1 = l.p1.y, y2 = l.p2.y, rise = y2 - y1, run = x2 - x1;
                // If x2 = x1, then it's a vertical line
                if (run == 0) {
                    l.coefficients = {
                        a: 1,
                        b: 0,
                        c: -x1
                    };
                }
                else {
                    var slope = rise / run;
                    l.coefficients = {
                        a: slope,
                        b: -1,
                        c: y1 - slope * x1
                    };
                }
                return l.updateLine();
            };
            return TwoPointLine;
        })(Linear);
        Functions.TwoPointLine = TwoPointLine;
        var HorizontalLine = (function (_super) {
            __extends(HorizontalLine, _super);
            function HorizontalLine(definition) {
                _super.call(this, definition);
            }
            // A horizontal line at y = Y may be written 0x - y + Y = 0
            HorizontalLine.prototype._update = function (scope) {
                var l = this;
                l.coefficients = {
                    a: 0,
                    b: -1,
                    c: l.y
                };
                return l.updateLine();
            };
            return HorizontalLine;
        })(Linear);
        Functions.HorizontalLine = HorizontalLine;
        var VerticalLine = (function (_super) {
            __extends(VerticalLine, _super);
            function VerticalLine(definition) {
                _super.call(this, definition);
            }
            // A vertical line at x = X may be written -x + 0y + X = 0
            VerticalLine.prototype._update = function (scope) {
                var l = this;
                l.coefficients = {
                    a: -1,
                    b: 0,
                    c: l.x
                };
                return l.updateLine();
            };
            return VerticalLine;
        })(Linear);
        Functions.VerticalLine = VerticalLine;
    })(Functions = KGMath.Functions || (KGMath.Functions = {}));
})(KGMath || (KGMath = {}));
/// <reference path="../kg.ts"/>
/// <reference path="functions/base.ts"/>
/// <reference path="functions/linear.ts"/>
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
                var labelDef = _.defaults(definition.label, {
                    name: definition.name + '_label',
                    coordinates: definition.coordinates,
                    color: 'white',
                    xDrag: definition.xDrag,
                    yDrag: definition.yDrag
                });
                this.labelDiv = new KG.GraphDiv(labelDef);
            }
            if (definition.droplines) {
                if (definition.droplines.hasOwnProperty('horizontal')) {
                    this.horizontalDropline = new KG.HorizontalDropline({
                        name: definition.name,
                        coordinates: definition.coordinates,
                        draggable: definition.yDrag,
                        axisLabel: definition.droplines.horizontal
                    });
                }
                if (definition.droplines.hasOwnProperty('vertical')) {
                    this.verticalDropline = new KG.VerticalDropline({
                        name: definition.name,
                        coordinates: definition.coordinates,
                        draggable: definition.xDrag,
                        axisLabel: definition.droplines.vertical
                    });
                }
            }
            this.viewObjectSVGtype = 'path';
            this.viewObjectClass = 'pointSymbol';
        }
        Point.prototype.createSubObjects = function (view) {
            var p = this;
            if (p.labelDiv) {
                view.addObject(p.labelDiv);
            }
            if (p.verticalDropline) {
                view.addObject(p.verticalDropline);
                p.verticalDropline.createSubObjects(view); // TODO should probably make this more recursive by default
            }
            if (p.horizontalDropline) {
                view.addObject(p.horizontalDropline);
                p.horizontalDropline.createSubObjects(view); // TODO should probably make this more recursive by default
            }
            return view;
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
                'fill': point.color,
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
    var Dropline = (function (_super) {
        __extends(Dropline, _super);
        function Dropline(definition) {
            definition.coordinates = KG.getCoordinates(definition.coordinates);
            definition = _.defaults(definition, {
                horizontal: false,
                draggable: false,
                axisLabel: ''
            });
            _super.call(this, definition);
            var labelDef = {
                name: definition.name + '_label',
                color: 'grey',
                text: definition.axisLabel,
                dimensions: { width: 30, height: 20 },
                backgroundColor: 'white'
            };
            if (definition.horizontal) {
                labelDef.coordinates = {
                    x: KG.GraphDiv.AXIS_COORDINATE_INDICATOR,
                    y: definition.coordinates.y
                };
                labelDef.yDrag = definition.draggable;
            }
            else {
                labelDef.coordinates = {
                    x: definition.coordinates.x,
                    y: KG.GraphDiv.AXIS_COORDINATE_INDICATOR
                };
                labelDef.xDrag = definition.draggable;
            }
            this.labelDiv = new KG.GraphDiv(labelDef);
            this.viewObjectSVGtype = 'line';
            this.viewObjectClass = 'dropline';
        }
        Dropline.prototype.createSubObjects = function (view) {
            var p = this;
            if (p.labelDiv) {
                view.addObject(p.labelDiv);
            }
            return view;
        };
        Dropline.prototype.render = function (view) {
            var dropline = this;
            var pointX = view.xAxis.scale(dropline.coordinates.x), pointY = view.yAxis.scale(dropline.coordinates.y), anchorX = dropline.horizontal ? view.xAxis.scale(view.xAxis.min) : pointX, anchorY = dropline.horizontal ? pointY : view.yAxis.scale(view.yAxis.min);
            var group = view.objectGroup(dropline.name, dropline.initGroupFn(), false);
            var droplineSelection = group.select('.' + dropline.viewObjectClass);
            droplineSelection.attr({
                'x1': anchorX,
                'y1': anchorY,
                'x2': pointX,
                'y2': pointY
            });
            return view;
        };
        return Dropline;
    })(KG.ViewObject);
    KG.Dropline = Dropline;
    var VerticalDropline = (function (_super) {
        __extends(VerticalDropline, _super);
        function VerticalDropline(definition) {
            definition.name += '_vDropline';
            definition.horizontal = false;
            _super.call(this, definition);
        }
        return VerticalDropline;
    })(Dropline);
    KG.VerticalDropline = VerticalDropline;
    var HorizontalDropline = (function (_super) {
        __extends(HorizontalDropline, _super);
        function HorizontalDropline(definition) {
            definition.name += '_hDropline';
            definition.horizontal = true;
            _super.call(this, definition);
        }
        return HorizontalDropline;
    })(Dropline);
    KG.HorizontalDropline = HorizontalDropline;
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
            definition.color = definition.color || 'gray';
            _super.call(this, definition);
            if (definition.label) {
                var labelDef = _.defaults(definition.label, {
                    name: definition.name + '_label',
                    xDrag: definition.xDrag,
                    yDrag: definition.yDrag,
                    color: definition.color
                });
                this.labelDiv = new KG.GraphDiv(labelDef);
            }
            this.startArrow = (definition.arrows == Segment.START_ARROW_STRING || definition.arrows == Segment.BOTH_ARROW_STRING);
            this.endArrow = (definition.arrows == Segment.END_ARROW_STRING || definition.arrows == Segment.BOTH_ARROW_STRING);
            this.viewObjectSVGtype = 'path';
            this.viewObjectClass = 'segment';
        }
        Segment.prototype._update = function (scope) {
            var segment = this;
            segment.midpoint = {
                x: 0.5 * (segment.a.x + segment.b.x),
                y: 0.5 * (segment.a.y + segment.b.y)
            };
            if (segment.hasOwnProperty('labelDiv')) {
                segment.labelDiv.coordinates = segment.midpoint;
            }
            segment.length = KG.distanceBetweenCoordinates(segment.a, segment.b);
            return segment;
        };
        Segment.prototype.createSubObjects = function (view) {
            var labelDiv = this.labelDiv;
            if (labelDiv) {
                return view.addObject(labelDiv);
            }
            else {
                return view;
            }
        };
        Segment.prototype.render = function (view) {
            var segment = this;
            var group = view.objectGroup(segment.name, segment.initGroupFn(), false);
            if (segment.endArrow && segment.length > 0) {
                group.attr("marker-end", "url(#arrow-end-" + segment.color + ")");
            }
            else {
                group.attr("marker-end", null);
            }
            if (segment.startArrow && segment.length > 0) {
                group.attr("marker-start", "url(#arrow-start-" + segment.color + ")");
            }
            else {
                group.attr("market-start", null);
            }
            var dataLine = d3.svg.line().x(function (d) {
                return view.xAxis.scale(d.x);
            }).y(function (d) {
                return view.yAxis.scale(d.y);
            });
            var segmentSelection = group.select('.' + segment.viewObjectClass);
            segmentSelection.attr({
                'class': segment.classAndVisibility(),
                'd': dataLine([segment.startPoint(view), segment.endPoint(view)]),
                'stroke': segment.color
            });
            return view;
        };
        Segment.prototype.startPoint = function (view) {
            return this.a;
        };
        Segment.prototype.endPoint = function (view) {
            return this.b;
        };
        Segment.START_ARROW_STRING = 'START';
        Segment.END_ARROW_STRING = 'END';
        Segment.BOTH_ARROW_STRING = 'BOTH';
        return Segment;
    })(KG.ViewObject);
    KG.Segment = Segment;
})(KG || (KG = {}));
/// <reference path="../kg.ts"/>
'use strict';
var KG;
(function (KG) {
    var Line = (function (_super) {
        __extends(Line, _super);
        function Line(definition) {
            definition.color = definition.color || 'gray';
            _super.call(this, definition);
            this.linear = new KGMath.Functions[definition.type](definition.def);
            this.viewObjectSVGtype = 'path';
            this.viewObjectClass = 'line';
        }
        Line.prototype._update = function (scope) {
            this.linear.update(scope);
            return this;
        };
        Line.prototype.render = function (view) {
            var NO_ARROW_STRING = 'NONE', BOTH_ARROW_STRING = 'BOTH', OPEN_ARROW_STRING = 'OPEN';
            var line = this, linear = this.linear;
            var group = view.objectGroup(line.name, line.initGroupFn(), false);
            var startPoint = linear.viewBoundaryPoints(view)[0], endPoint = linear.viewBoundaryPoints(view)[1];
            function addEndArrow() {
                group.attr("marker-end", "url(#arrow-end-" + line.color + ")");
            }
            function addStartArrow() {
                group.attr("marker-start", "url(#arrow-start-" + line.color + ")");
            }
            function removeEndArrow() {
                group.attr("marker-end", null);
            }
            function removeStartArrow() {
                group.attr("marker-start", null);
            }
            if (line.arrows == BOTH_ARROW_STRING) {
                addEndArrow();
                addStartArrow();
            }
            else if (line.arrows == OPEN_ARROW_STRING) {
                if (startPoint.x == view.xAxis.max || startPoint.y == view.yAxis.max) {
                    addStartArrow();
                }
                else {
                    removeStartArrow();
                }
                if (endPoint.x == view.xAxis.max || endPoint.y == view.yAxis.max) {
                    addEndArrow();
                }
                else {
                    removeEndArrow();
                }
            }
            else if (line.arrows == NO_ARROW_STRING) {
                removeEndArrow();
                removeStartArrow();
            }
            var dataLine = d3.svg.line().x(function (d) {
                return view.xAxis.scale(d.x);
            }).y(function (d) {
                return view.yAxis.scale(d.y);
            });
            var lineSelection = group.select('.' + line.viewObjectClass);
            lineSelection.attr({
                'class': line.classAndVisibility(),
                'd': dataLine(linear.viewBoundaryPoints(view)),
                'stroke': line.color
            });
            return view;
        };
        return Line;
    })(KG.ViewObject);
    KG.Line = Line;
})(KG || (KG = {}));
/// <reference path="../kg.ts"/>
'use strict';
var KG;
(function (KG) {
    var GraphDiv = (function (_super) {
        __extends(GraphDiv, _super);
        function GraphDiv(definition) {
            definition = _.defaults(definition, {
                dimensions: { width: 100, height: 20 },
                math: false,
                align: 'center',
                valign: 'middle',
                text: ''
            });
            _super.call(this, definition);
        }
        GraphDiv.prototype.render = function (view) {
            var divObj = this;
            var x, y;
            if (divObj.coordinates.x == GraphDiv.AXIS_COORDINATE_INDICATOR) {
                x = view.margins.left - view.yAxis.textMargin;
                divObj.align = 'right';
                divObj.valign = 'middle';
            }
            else {
                x = view.margins.left + view.xAxis.scale(divObj.coordinates.x);
            }
            if (divObj.coordinates.y == GraphDiv.AXIS_COORDINATE_INDICATOR) {
                y = view.dimensions.height - view.margins.bottom + view.xAxis.textMargin;
                divObj.align = 'center';
                divObj.valign = 'top';
            }
            else {
                y = view.margins.top + view.yAxis.scale(divObj.coordinates.y);
            }
            var width = divObj.dimensions.width, height = divObj.dimensions.height, text = divObj.text, draggable = (divObj.xDrag || divObj.yDrag);
            var div = view.getDiv(this.name);
            div.style('cursor', 'default').style('text-align', 'center').style('color', divObj.color).style('position', 'absolute').style('width', width + 'px').style('height', height + 'px').style('line-height', height + 'px').style('background-color', divObj.backgroundColor);
            // Set left pixel margin; default to centered on x coordinate
            var alignDelta = width * 0.5;
            if (divObj.align == 'left') {
                alignDelta = 0;
                div.style('text-align', 'left');
            }
            else if (this.align == 'right') {
                // move left by half the width of the div if right aligned
                alignDelta = width;
                div.style('text-align', 'right');
            }
            div.style('left', (x - alignDelta) + 'px');
            // Set top pixel margin; default to centered on y coordinate
            var vAlignDelta = height * 0.5;
            // Default to centered on x coordinate
            if (this.valign == 'top') {
                vAlignDelta = 0;
            }
            else if (this.valign == 'bottom') {
                vAlignDelta = height;
            }
            div.style('top', (y - vAlignDelta) + 'px');
            katex.render(text.toString(), div[0][0]);
            if (draggable) {
                divObj.xDragDelta = -view.margins.left;
                divObj.yDragDelta = view.dimensions.height - vAlignDelta;
                return divObj.setDragBehavior(view, div);
            }
            else {
                return view;
            }
        };
        GraphDiv.AXIS_COORDINATE_INDICATOR = 'AXIS';
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
            // Establish marker style for arrow
            svg.append("svg:defs").selectAll("marker").data(["red", "gray", "blue", "purple"]).enter().append("marker").attr("id", function (d) {
                return "arrow-end-" + d;
            }).attr("refX", 11).attr("refY", 6).attr("markerWidth", 13).attr("markerHeight", 13).attr("orient", "auto").attr("markerUnits", "userSpaceOnUse").append("svg:path").attr("d", "M2,2 L2,11 L10,6 L2,2").attr("fill", function (d) {
                return d;
            });
            // Establish marker style for arrow
            svg.append("svg:defs").selectAll("marker").data(["red", "gray", "blue", "purple"]).enter().append("svg:marker").attr("id", function (d) {
                return "arrow-start-" + d;
            }).attr("refX", 2).attr("refY", 6).attr("markerWidth", 13).attr("markerHeight", 13).attr("orient", "auto").attr("markerUnits", "userSpaceOnUse").append("svg:path").attr("d", "M11,2 L11,11 L2,6 L11,2").attr("fill", function (d) {
                return d;
            });
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
                ticks: 5,
                textMargin: 7
            });
            _super.call(this, definition);
            if (this.ticks == 0) {
                this.textMargin = 7;
            }
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
        function Controller($scope, $interpolate, $window) {
            this.$scope = $scope;
            this.$interpolate = $interpolate;
            $scope.interpolate = $interpolate;
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
                    var textToRender = $scope.interpolate(element.getAttribute('raw'))($scope);
                    var displayMode = element.classList.contains('displayMath');
                    katex.render(textToRender, element, { displayMode: displayMode });
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
            $scope.init(scopeDefinition);
            render(true);
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
                label: {
                    text: definition.name
                }
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
                label: {
                    text: 'RF'
                }
            });
            p.optimalPortfolio = new KG.Point({
                name: 'optimalPortfolio',
                coordinates: { x: 'params.optimalPortfolioStDev', y: 'params.optimalPortfolioMean' },
                symbol: 'cross',
                size: 100,
                xDrag: false,
                yDrag: false,
                label: {
                    text: 'P',
                    color: 'blue',
                    align: 'right',
                    valign: 'bottom'
                },
                color: 'blue'
            });
            p.riskReturnLine = new KG.Line({
                type: 'TwoPointLine',
                def: {
                    name: 'twoPointSegment',
                    a: p.riskFreeAsset,
                    b: p.optimalPortfolio,
                    color: 'blue'
                }
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
/// <reference path="../eg.ts"/>
var EconGraphs;
(function (EconGraphs) {
    var Elasticity = (function (_super) {
        __extends(Elasticity, _super);
        function Elasticity(definition) {
            definition.inverse = _.defaults(false, definition.inverse);
            definition.terms = _.defaults({
                perfectlyElastic: "'perfectly elastic'",
                perfectlyInelastic: "'perfectly inelastic'",
                elastic: "'elastic'",
                inelastic: "'inelastic'",
                unitElastic: "'unit elastic'"
            }, definition.terms);
            _super.call(this, definition);
        }
        Elasticity.prototype.calculateElasticity = function () {
            var e = this;
            e.absoluteElasticity = Math.abs(e.elasticity);
            if (isNaN(e.absoluteElasticity)) {
                e.absoluteElasticity == '\\emptyset';
            }
            e.elasticityComparator = e.elasticityNumber(true);
            if (e.absoluteElasticity == 0) {
                e.elasticityWord = e.terms.perfectlyInelastic;
            }
            else if (e.absoluteElasticity < 1) {
                e.elasticityWord = e.terms.inelastic;
                e.elasticityComparator += "< 1";
            }
            else if (e.absoluteElasticity == 1) {
                e.elasticityWord = e.terms.unitElastic;
            }
            else if (e.absoluteElasticity == Infinity) {
                e.elasticityWord = e.terms.perfectlyElastic;
            }
            else if (e.absoluteElasticity > 1) {
                e.elasticityWord = e.terms.elastic;
                e.elasticityComparator += "> 1";
            }
            else {
                e.elasticityWord = 'undefined';
            }
            return e;
        };
        Elasticity.prototype.elasticityNumber = function (absoluteValue) {
            var e = this;
            absoluteValue = absoluteValue || false;
            if (isNaN(e.absoluteElasticity)) {
                return "\\emptyset";
            }
            var returnString = (!absoluteValue && e.elasticity < 0) ? '-' : '';
            returnString += (e.absoluteElasticity == Infinity) ? "\\infty" : (e.absoluteElasticity == 0) ? "0" : (e.absoluteElasticity == 1) ? "1" : e.absoluteElasticity.toFixed(2);
            return returnString;
        };
        return Elasticity;
    })(KG.Model);
    EconGraphs.Elasticity = Elasticity;
})(EconGraphs || (EconGraphs = {}));
/// <reference path="../eg.ts"/>
'use strict';
var EconGraphs;
(function (EconGraphs) {
    var MidpointElasticity = (function (_super) {
        __extends(MidpointElasticity, _super);
        function MidpointElasticity(definition) {
            _super.call(this, definition);
            this.point1view = new KG.Point({
                name: 'point1',
                coordinates: definition.point1,
                size: 500,
                xDrag: true,
                yDrag: true,
                label: {
                    text: 'B'
                },
                droplines: {
                    horizontal: 'P_B',
                    vertical: 'Q_B'
                }
            });
            this.point2view = new KG.Point({
                name: 'point2',
                coordinates: definition.point2,
                size: 500,
                xDrag: true,
                yDrag: true,
                label: {
                    text: 'A'
                },
                droplines: {
                    horizontal: 'P_A',
                    vertical: 'Q_A'
                }
            });
            this.midpoint = new KG.Point({
                name: 'midpoint',
                coordinates: {
                    x: 'model.xAvg',
                    y: 'model.yAvg'
                },
                symbol: 'cross',
                color: 'grey',
                size: 100,
                xDrag: false,
                yDrag: false,
                label: {
                    text: 'M',
                    align: 'right',
                    valign: 'top',
                    color: 'grey'
                }
            });
            this.line = new KG.Line({
                name: 'demand',
                color: 'purple',
                arrows: 'OPEN',
                type: 'TwoPointLine',
                def: {
                    p1: {
                        x: 'params.x1',
                        y: 'params.y1'
                    },
                    p2: {
                        x: 'params.x2',
                        y: 'params.y2'
                    }
                }
            });
            this.xDiffSegment = new KG.Segment({
                name: 'xDiffSegment',
                color: 'blue',
                arrows: 'END',
                a: {
                    x: definition.point2.x,
                    y: 5
                },
                b: {
                    x: definition.point1.x,
                    y: 5
                },
                label: {
                    text: 'model.xPercentDiff | percentage:0',
                    valign: 'top'
                }
            });
            this.yDiffSegment = new KG.Segment({
                name: 'yDiffSegment',
                color: 'red',
                arrows: 'END',
                a: {
                    x: 15,
                    y: definition.point2.y
                },
                b: {
                    x: 15,
                    y: definition.point1.y
                },
                label: {
                    text: 'model.yPercentDiff | percentage:0',
                    align: 'right'
                }
            });
        }
        MidpointElasticity.prototype._update = function (scope) {
            var e = this;
            e.xDiff = e.point1.x - e.point2.x;
            e.yDiff = e.point1.y - e.point2.y;
            e.xAvg = 0.5 * (e.point1.x + e.point2.x);
            e.yAvg = 0.5 * (e.point1.y + e.point2.y);
            e.xPercentDiff = e.xDiff / e.xAvg;
            e.yPercentDiff = e.yDiff / e.yAvg;
            e.elasticity = e.xPercentDiff / e.yPercentDiff;
            return e.calculateElasticity();
        };
        return MidpointElasticity;
    })(EconGraphs.Elasticity);
    EconGraphs.MidpointElasticity = MidpointElasticity;
})(EconGraphs || (EconGraphs = {}));
/// <reference path="../eg.ts"/>
'use strict';
var EconGraphs;
(function (EconGraphs) {
    var PointElasticity = (function (_super) {
        __extends(PointElasticity, _super);
        function PointElasticity(definition) {
            _super.call(this, definition);
            this.pointView = new KG.Point({
                name: 'point',
                coordinates: definition.point,
                size: 500,
                xDrag: true,
                yDrag: true,
                droplines: {
                    horizontal: 'P',
                    vertical: 'Q'
                }
            });
            this.line = new KGMath.Functions.PointSlopeLine({
                p: definition.point,
                m: definition.slope
            });
        }
        PointElasticity.prototype._update = function (scope) {
            var e = this;
            e.elasticity = (e.point.x / e.point.y) * e.slope;
            return e.calculateElasticity();
        };
        return PointElasticity;
    })(EconGraphs.Elasticity);
    EconGraphs.PointElasticity = PointElasticity;
})(EconGraphs || (EconGraphs = {}));
/// <reference path="../kg.ts"/>
/// <reference path="elasticity/elasticity.ts"/>
/// <reference path="elasticity/midpoint.ts"/>
/// <reference path="elasticity/point.ts"/>
/// <reference path="../bower_components/DefinitelyTyped/jquery/jquery.d.ts" />
/// <reference path="../bower_components/DefinitelyTyped/jquery.color/jquery.color.d.ts" />
/// <reference path="../bower_components/DefinitelyTyped/angularjs/angular.d.ts"/>
/// <reference path="../bower_components/DefinitelyTyped/d3/d3.d.ts"/>
/// <reference path="../bower_components/DefinitelyTyped/underscore/underscore.d.ts"/>
/// <reference path="helpers.ts" />
/// <reference path="model.ts" />
/// <reference path="restriction.ts" />
/// <reference path="math/math.ts" />
/// <reference path="viewObjects/viewObject.ts"/>
/// <reference path="viewObjects/point.ts"/>
/// <reference path="viewObjects/dropline.ts"/>
/// <reference path="viewObjects/segment.ts"/>
/// <reference path="viewObjects/line.ts"/>
/// <reference path="viewObjects/graphDiv.ts"/>
/// <reference path="viewObjects/linePlot.ts"/>
/// <reference path="viewObjects/pathFamily.ts"/>
/// <reference path="view.ts" />
/// <reference path="views/axis.ts" />
/// <reference path="views/graph.ts" />
/// <reference path="views/slider.ts" />
/// <reference path="controller.ts" />
/// <reference path="sample/sample.ts" />
/// <reference path="finance/fg.ts" />
/// <reference path="econ/eg.ts" />
'use strict';
angular.module('KineticGraphs', []).controller('KineticGraphCtrl', ['$scope', '$interpolate', '$window', KG.Controller]).filter('percentage', ['$filter', function ($filter) {
    return function (input, decimals) {
        return $filter('number')(input * 100, decimals) + '\\%';
    };
}]);
//# sourceMappingURL=kinetic-graphs.js.map