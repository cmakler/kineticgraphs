/* 
 A linear function is a special polynomial defined either with two points or a point and a slope.
 This function takes either of those and returns a polynomial of the form ax + by + c.
 The params object is of the form: { definitionType: '', param1: foo, param2: bar }
 */

module KGMath.Functions {

    export interface LinearDefinition {
        //entirely determined by subclass
    }

    // a line is defined by the equation ax + by + c = 0
    export interface LinearCoefficients {
        a: number;
        b: number;
        c: number;
    }

    export interface ILinear extends IBase {
        slope: number;
        inverseSlope: number;
        coefficients: LinearCoefficients;
        updateLine: () => Linear;
        xIntercept: number;
        yIntercept: number;
        isVertical: boolean;
        isHorizontal: boolean;
    }

    export class Linear extends Base implements ILinear {

        public slope;
        public inverseSlope;
        public coefficients;
        public xIntercept;
        public yIntercept;
        public isVertical;
        public isHorizontal;

        constructor(definition:LinearDefinition) {
            super(definition);
            this._calculateValues();
        }

        _update(scope) {
            return this.updateLine();
        }

        updateLine() {

            var l = this;

            var a = l.coefficients.a,
                b = l.coefficients.b,
                c = l.coefficients.c;

            l.isVertical = (b === 0);
            l.isHorizontal = (a === 0);

            l.slope = l.isVertical ? Infinity : -a/b;
            l.inverseSlope = l.isHorizontal ? Infinity : -b/a;

            l.xIntercept = l.isHorizontal ? null : -c/a;
            l.yIntercept = l.isVertical ? null : -c/b;

            return l;

        }

        yValue(x) {
            var l = this.updateLine();
            return l.isVertical ? undefined : l.yIntercept + l.slope * x;
        }

        xValue(y) {
            var l = this.updateLine();
            return l.isHorizontal ? undefined : l.xIntercept + l.inverseSlope * y;
        }

        points(view:KG.IView) {

            var l = this;

            var xDomain = view.xAxis.domain,
                yDomain = view.yAxis.domain;

            var points: KG.ICoordinates[] = [];


            if(l.isVertical) {
                points = [{x: l.xIntercept, y: yDomain.min}, {x: l.xIntercept, y: yDomain.max}];
            } else if(l.isHorizontal) {
                points = [{x: xDomain.min, y: l.yIntercept}, {x: xDomain.max, y: l.yIntercept}];
            } else {
                var xTop = l.xValue(yDomain.max),
                    xBottom = l.xValue(yDomain.min),
                    yLeft = l.yValue(xDomain.min),
                    yRight = l.yValue(xDomain.max);

                // add endpoints on the left or right sides, including the corners
                if(yDomain.contains(yLeft)) {
                    points.push({x:xDomain.min, y:yLeft});
                }
                if(yDomain.contains(yRight)) {
                    points.push({x:xDomain.max, y:yRight});
                }

                // add endpoints on the top or bottom, not including the corners
                if(xDomain.contains(xBottom, true)) {
                    points.push({x:xBottom, y:yDomain.min});
                }
                if(xDomain.contains(xTop, true)) {
                    points.push({x:xTop, y:yDomain.max});
                }

                // A maximimum of two points should have been added. If not, something is wrong.
                if(points.length > 2) {
                    console.log('Oh noes! More than two points! Investigate!')
                }

            }

            return points;
        }

        linearIntersection = function(otherLine:Linear, delta?:number) {

            var thisLine = this;

            delta = delta || 0;

            var a = thisLine.coefficients.a,
                b = thisLine.coefficients.b,
                c = thisLine.coefficients.c,
                oa = otherLine.coefficients.a,
                ob = otherLine.coefficients.b,
                oc = otherLine.coefficients.c;


            var diffLine = new Linear({
                    coefficients: {
                        a: a*ob - b*oa,
                        b: b*ob,
                        c: ob*c - oc*b - delta
                    }
                }),
                x = diffLine.xIntercept,
                y = thisLine.yValue(x);

            return {x: x, y: y};
        };

    }

    // Standard definition: define the line by ax + by + c = 0.
    export interface StandardLineDefinition extends LinearDefinition {
        coefficients: LinearCoefficients;
    }

    export class StandardLine extends Linear {
        constructor(definition:StandardLineDefinition) {
            super(definition);
        }
    }

    // Slope-intercept definition: define the line by y = mx + b.
    export interface SlopeInterceptLineDefinition extends LinearDefinition {
        m: any;
        b: any;
    }

    export class SlopeInterceptLine extends Linear {

        private m: number;
        private b: number;

        constructor(definition:SlopeInterceptLineDefinition) {
            super(definition)
        }

        // Given y = m*x + b => m*x + (-1)y + b = 0
        _calculateValues() {

            var l = this;

            l.coefficients = {
                a: l.m,
                b: -1,
                c: l.b
            };

            return l.updateLine();

        }
    }

    // Point-slope definition: define the line by a single point and a slope m.

    export interface PointSlopeLineDefinition extends LinearDefinition {
        p: KG.ICoordinates;
        m: any;
    }

    export class PointSlopeLine extends Linear {

        private p: KG. ICoordinates;
        private m: number;

        constructor(definition:PointSlopeLineDefinition) {
            definition.p = KG.getCoordinates(definition.p);
            super(definition)
        }

        // Given Y - y = slope(X - x) => slope*X - Y + (y - slope*x)
        _calculateValues() {

            var l = this;

            l.coefficients = {
                a: l.m,
                b: -1,
                c: l.p.y - l.m*l.p.x
            };

            return l.updateLine();
        }

    }

    // Point-point definition: define the line by a two points.

    export interface TwoPointLineDefinition extends LinearDefinition {
        p1: KG.ICoordinates;
        p2: KG.ICoordinates;
    }

    export class TwoPointLine extends Linear {

        private p1: KG.ICoordinates;
        private p2: KG.ICoordinates;

        constructor(definition:TwoPointLineDefinition) {
            definition.p1 = KG.getCoordinates(definition.p1);
            definition.p2 = KG.getCoordinates(definition.p2);
            super(definition)
        }

        _calculateValues() {

            var l = this;

            var x1 = l.p1.x,
                x2 = l.p2.x,
                y1 = l.p1.y,
                y2 = l.p2.y,
                rise = y2 - y1,
                run = x2 - x1;

            // If x2 = x1, then it's a vertical line
            if (run == 0) {
                l.coefficients = {
                    a: 1,
                    b: 0,
                    c: -x1
                }
            } else {
                var slope = rise/run;
                l.coefficients = {
                    a: slope,
                    b: -1,
                    c: y1 - slope*x1
                }
            }

            return l.updateLine();
        }

    }

    // Horizontal line definition: define the line by a single y coordinate.

    export interface HorizontalLineDefinition extends LinearDefinition {
        y: any;
    }

    export class HorizontalLine extends Linear {

        public y;

        constructor(definition:PointSlopeLineDefinition) {
            super(definition)
        }

        // A horizontal line at y = Y may be written 0x - y + Y = 0
        _calculateValues() {

            var l=this;

            l.coefficients = {
                a: 0,
                b: -1,
                c: l.y
            };

            return l.updateLine();
        }

    }

    // Vertical line definition: define the line by a single x coordinate.

    export interface VerticalLineDefinition extends LinearDefinition {
        x: any;
    }

    export class VerticalLine extends Linear {

        public x;

        constructor(definition:PointSlopeLineDefinition) {
            super(definition)
        }

        // A vertical line at x = X may be written -x + 0y + X = 0
        _calculateValues() {

            var l=this;

            l.coefficients = {
                a: -1,
                b: 0,
                c: l.x
            };

            return l.updateLine();
        }

    }

}
