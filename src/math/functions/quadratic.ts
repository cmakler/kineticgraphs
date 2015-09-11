/* 
 A quadratic function is a special polynomial defined either with two points or a point and a slope.
 This function takes either of those and returns a polynomial of the form ax + by + c.
 The params object is of the form: { definitionType: '', param1: foo, param2: bar }
 */

module KGMath.Functions {

    export interface QuadraticDefinition extends BaseDefinition {
        coefficients?: QuadraticCoefficients;
        vertex?: KG.ICoordinates;
        point?: KG.ICoordinates;
    }

    // a line is defined by the equation ax + by + c = 0
    export interface QuadraticCoefficients {
        a: any;
        b: any;
        c: any;
    }

    export interface IQuadratic extends IBase {
        coefficients: QuadraticCoefficients;
        vertex: KG.ICoordinates;
        point?: KG.ICoordinates;
        roots: number[];
        discriminant: number;
        derivative: () => Linear;
        integral: () => Polynomial;
        add: (x: number) => Quadratic;
        multiply: (x: number) => Quadratic;
    }

    export class Quadratic extends Base implements IQuadratic {

        public coefficients;
        public vertex;
        public point;
        public roots;
        public discriminant;

        constructor(definition:QuadraticDefinition, modelPath?) {
            super(definition, modelPath);
            definition.coefficients = definition.coefficients || {a: 1, b: 1, c: 1};

            if(!definition.hasOwnProperty('vertex') && definition.coefficients.a != 0) {
                var negativeB = KG.multiplyDefs(-1,definition.coefficients.b),
                    twoA = KG.multiplyDefs(2,definition.coefficients.a),
                    vertexX = KG.divideDefs(negativeB,twoA),
                    vertexY = this.modelProperty('yValue('+vertexX+')');
                definition.vertex = {
                    x: vertexX,
                    y: vertexY
                }
            }
        }

        _update(scope) {
            var q = this;
            q.discriminant = q.coefficients.b*q.coefficients.b - 4*q.coefficients.a*q.coefficients.c
            return q;
        }

        // The derivative of ax^2 + bx + c is 2ax + b
        derivative(n?) {
            var coefficients = this.coefficients;
            return new Linear({
                slope: KG.multiplyDefs(coefficients.a,2),
                intercept: coefficients.b
            })
        }

        // The integral of ax^2 + bx + c is (a/3)x^3 + (b/2)x^2 + cx + C
        integral(n?,c?) {
            var coefficients:QuadraticCoefficients = this.coefficients;
            if(!c) {
                c = 0;
            }
            return new Polynomial({
                termDefs:[
                    {
                        coefficient: KG.divideDefs(coefficients.a,3),
                        powers: [3]
                    },
                    {
                        coefficient: KG.divideDefs(coefficients.b,2),
                        powers: [2]
                    },
                    {
                        coefficient: coefficients.c,
                        powers: [1]
                    },
                    {
                        coefficient: c,
                        powers: [0]
                    }
                ]
            })
        }

        multiply(x) {
            var q = this;
            return new Quadratic({
                coefficients: {
                    a: KG.multiplyDefs(q.coefficients.a,x),
                    b: KG.multiplyDefs(q.coefficients.b,x),
                    c: KG.multiplyDefs(q.coefficients.c,x)
                }
            })
        }

        add(x) {
            var q = this;
            return new Quadratic({
                coefficients: {
                    a: q.coefficients.a,
                    b: q.coefficients.b,
                    c: KG.addDefs(q.coefficients.c,x)
                }
            })
        }

        yValue(x) {
            var coefficients = this.coefficients;
            return coefficients.a*x*x + coefficients.b*x + coefficients.c;
        }

        private differenceFromVertex(y) {
            var q = this,
                a = q.coefficients.a,
                b = q.coefficients.b,
                c = q.coefficients.c - y;
            if(b*b > 4*a*c) {
                return Math.abs(1/(2*a))*Math.sqrt(b*b - 4*a*c)
            } else {
                return null;
            }
        }

        // for xValue, use higher real root of ax^2 + bx + c - y
        xValue(y) {
            var q = this;
            if(q.coefficients.a < 0) {
                // downward facing parabola; real roots exist if y < vertex Y
                if(y > q.vertex.y) {
                    return null;
                }
            } else if(q.coefficients.a == 0) {
                if(q.coefficients.b == 0) {
                    return null;
                } else {
                    return (y - q.coefficients.c)/q.coefficients.b;
                }
            } else {
                if(y < q.vertex.y) {
                    return null;
                }
            }
            return q.vertex.x + this.differenceFromVertex(y);
        }

        points(view, yIsIndependent, numSamplePoints) {

            var q = this,
                points = [];

            numSamplePoints = numSamplePoints || 51;

            if(q.coefficients.a == 0) {
                var l = new KGMath.Functions.Linear({
                    coefficients: {
                        a: q.coefficients.b,
                        b: -1,
                        c: q.coefficients.c
                    }
                });
                return l.points(view);
            }

            var inverse = (q.coefficients.a < 0);

            var xDomain, yDomain;

            if(yIsIndependent) {
                xDomain = inverse ? new KG.Domain(view.xAxis.min, q.vertex.y) : new KG.Domain(q.vertex.y, view.xAxis.max);
                yDomain = view.yAxis.domain;
            } else {
                xDomain = view.xAxis.domain;
                yDomain = inverse ? new KG.Domain(view.yAxis.min, q.vertex.y) : new KG.Domain(q.vertex.y, view.yAxis.max);
            }

            var xSamplePoints = xDomain.samplePoints(numSamplePoints),
                ySamplePoints = yDomain.samplePoints(numSamplePoints);

            for(var i = 0; i < numSamplePoints; i++) {
                var x = xSamplePoints[i];
                var y = ySamplePoints[i];
                if(yIsIndependent) {
                    var xOfY = q.yValue(y);
                    if(view.onGraph({x: xOfY, y: y})) {points.push({x: xOfY, y: y})};
                    var yLow = q.vertex.x - q.differenceFromVertex(x);
                    if(view.onGraph({x: x, y: yLow})) {points.push({x: x, y: yLow})};
                    var yHigh = q.vertex.x + q.differenceFromVertex(x);
                    if(view.onGraph({x: x, y: yHigh})) {points.push({x: x, y: yHigh})};
                } else {
                    var yOfX = q.yValue(x);
                    if(view.onGraph({x: x, y: yOfX})) {points.push({x: x, y: yOfX})};
                    var xLow = q.vertex.x - q.differenceFromVertex(y);
                    if(view.onGraph({x: xLow, y: y})) {points.push({x: xLow, y: y})};
                    var xHigh = q.vertex.x + q.differenceFromVertex(y);
                    if(view.onGraph({x: xHigh, y: y})) {points.push({x: xHigh, y: y})};
                }
                points.push({x: q.vertex.x, y:q.vertex.y})
            }

            if (yIsIndependent) {
                return points.sort(KG.sortObjects('y'));
            } else {
                return points.sort(KG.sortObjects('x'));
            }

        }

    }

}
