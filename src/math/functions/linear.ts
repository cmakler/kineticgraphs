/* 
 A linear function is a special polynomial defined either with two points or a point and a slope.
 This function takes either of those and returns a polynomial of the form ax + by + c.
 The params object is of the form: { definitionType: '', param1: foo, param2: bar }
 */

module KGMath.Functions {

    export interface LinearDefinition extends BaseDefinition {
        coefficients?: LinearCoefficients;
        slope?: any;
        intercept?: any;
        point?: any;
        point1?: any;
        point2?: any;
    }

    // a line is defined by the equation ax + by + c = 0
    export interface LinearCoefficients {
        a: any;
        b: any;
        c: any;
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
        point?: KG.ICoordinates;
        derivative: () => HorizontalLine;
        integral: (n?: number, c?: number) => Linear | Quadratic;
    }

    export class Linear extends Base implements ILinear {

        public slope;
        public slopeDef;
        public interceptDef;
        public inverseSlope;
        public coefficients;
        public xIntercept;
        public yIntercept;
        public isVertical;
        public isHorizontal;
        public point;

        constructor(definition:LinearDefinition, modelPath?: string) {

            super(definition, modelPath);

            definition.coefficients = definition.coefficients || {a: 0, b: -1, c: 0};

            var l = this;

            if(definition.hasOwnProperty('point1') && definition.hasOwnProperty('point2')) {
                var p1 = KG.getCoordinates(definition.point1),
                    p2 = KG.getCoordinates(definition.point2),
                    rise = KG.subtractDefs(p2.y,p1.y),
                    run = KG.subtractDefs(p2.x,p1.x);
                definition.slope = KG.divideDefs(rise,run);
                definition.point = p1;
            }

            if(definition.hasOwnProperty('slope') && definition.slope != undefined) {
                definition.coefficients.a = definition.slope;
                if(definition.hasOwnProperty('intercept')) {
                    definition.coefficients.c = definition.intercept;
                    l.interceptDef = definition.intercept;
                } else if(definition.hasOwnProperty('point') && definition.point != undefined) {
                    var mx = KG.multiplyDefs(definition.slope,definition.point.x);
                    definition.coefficients.c = KG.subtractDefs(definition.point.y,mx);
                }
            } else {
                definition.slope = KG.multiplyDefs(-1,KG.divideDefs(definition.coefficients.a,definition.coefficients.b));
            }

            l.slopeDef = definition.slope;
            l.interceptDef = l.interceptDef || KG.multiplyDefs(-1,KG.divideDefs(definition.coefficients.c,definition.coefficients.b));
        }

        _update(scope) {
            return this.updateLine();
        }

        updateLine() {

            var l = this;

            var a = l.coefficients.a,
                b = l.coefficients.b,
                c = l.coefficients.c;

            l.isVertical = (b === 0) || (a === Infinity) || (a === -Infinity);
            l.isHorizontal = (a === 0);

            l.slope = l.isVertical ? Infinity : -a/b;
            l.inverseSlope = l.isHorizontal ? Infinity : -b/a;

            l.xIntercept = l.isHorizontal ? null : (l.isVertical && l.hasOwnProperty('point')) ? l.point.x : -c/a;
            l.yIntercept = l.isVertical ? null : -c/b;

            return l;

        }

        // The derivative of ax^2 + bx + c is 2ax + b
        derivative(n?) {
            var m = this.slopeDef || this.slope || 0;
            return new HorizontalLine({
                y: m
            });
        }

        // The integral of mx + b is (m/2)x^2 + bx + c
        integral(n?,c?,name?:string): (Linear | Quadratic) {
            var m = this;
            if(!c) {
                c = 0;
            }
            if(m instanceof HorizontalLine) {
                return new Linear({
                    slope: m.y,
                    intercept: c
                },name)
            } else {
                return new Quadratic({
                    coefficients: {
                        a: KG.multiplyDefs(0.5,m.slopeDef),
                        b: m.interceptDef,
                        c: c
                    }
                },name)
            }


        }

        add(x,name?:string) {
            var m = this;
            return new Linear({
                slope: m.slopeDef,
                intercept: KG.addDefs(m.interceptDef,x)
            },name)
        }

        // The average of ax^2 + bx + c is ax + b + cx^-2 + C
        average(n?,name?) {
            var l = this;
            name = name ? l.modelProperty(name) : null;
            return new Polynomial({
                termDefs:[
                    {
                        coefficient: l.slopeDef,
                        powers: [0]
                    },
                    {
                        coefficient: l.interceptDef,
                        powers: [-1]
                    }
                ]
            },name)
        }

        yValue(x) {
            var l = this.updateLine();
            var y = l.isVertical ? undefined : l.yIntercept + l.slope * x;
            return y;
        }

        xValue(y) {
            var l = this.updateLine();
            var x = l.isHorizontal ? undefined : l.xIntercept + l.inverseSlope * y;
            return x;
        }

        points(view:KG.IView) {

            var l = this;

            var xDomain = view.xAxis.domain.intersection(l.xDomain),
                yDomain = view.yAxis.domain.intersection(l.yDomain);

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
                if(xDomain.contains(xBottom, true) && yLeft != yDomain.min && yRight != yDomain.min) {
                    points.push({x:xBottom, y:yDomain.min});
                }
                if(xDomain.contains(xTop, true) && yLeft != yDomain.max && yRight != yDomain.max) {
                    points.push({x:xTop, y:yDomain.max});
                }

                // A maximimum of two points should have been added. If not, something is wrong.
                if(points.length > 2) {
                    console.log('Oh noes! More than two points! Investigate!')
                }

            }

            return points.sort(KG.sortObjects('x'));
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
                }).updateLine(),
                x = diffLine.xIntercept,
                y = thisLine.yValue(x);

            return {x: x, y: y};
        };

    }

    // Horizontal line definition: define the line by a single y coordinate.

    export interface HorizontalLineDefinition extends LinearDefinition {
        y: any;
    }

    export class HorizontalLine extends Linear {

        public y;

        constructor(definition:HorizontalLineDefinition, modelPath?: string) {
            definition.coefficients = {
                a: 0,
                b: -1,
                c: definition.y
            };
            super(definition,modelPath);
        }

    }

    // Vertical line definition: define the line by a single x coordinate.

    export interface VerticalLineDefinition extends LinearDefinition {
        x: any;
    }

    export class VerticalLine extends Linear {

        public x;

        constructor(definition:VerticalLineDefinition, modelPath?: string) {
            definition.coefficients = {
                a: -1,
                b: 0,
                c: definition.x
            };
            super(definition,modelPath);
        }

    }

}
