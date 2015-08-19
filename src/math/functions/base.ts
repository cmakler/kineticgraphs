module KGMath.Functions {

    export interface BaseDefinition {
        yValue? : () => number;
        level?: any;
    }

    export interface IBase extends KG.IModel {
        level: number;
        setLevel: (level:number) => any;
        bases: number[];
        setBase: (index:number, base:number) => any;
        setBases:(bases:number[]) => any;
        value: (bases?:number[]) => number;
        xValue: (x:number) => number;
        yValue: (y:number) => number;
        points: (view:KG.View, yIsIndependent?:boolean, numSamplePoints?:number) => KG.ICoordinates[];
        slopeBetweenPoints: (a: number, b?: number, inverse?: boolean) => number;
    }

    export class Base extends KG.Model {

        public level;
        public bases;

        constructor(definition) {
            definition.level = definition.level || 0;
            super(definition);
        }

        // Returns the slope between (a,f(a)) and (b,f(b)).
        // If inverse = true, returns the slope between (f(a),a) and (f(b),b).
        // Assumes that a and b are both scalars (for now).
        slopeBetweenPoints(a,b,inverse) {

            var f = this;

            b = b || 0;
            inverse = inverse || false;

            var s = (f.yValue(a) - f.yValue(b))/(a - b);

            return inverse ? 1/s : s;
        }

        setBase(index, base) {
            var fn = this;
            if(fn.hasOwnProperty('bases')) {
                fn.bases[index - 1] = base;
            } else {
                fn.bases = [];
                for(var i = 0; i < index; i++) {
                    fn.bases.push((i == index - 1) ? base : 1);
                }
            }
            return fn;
        }

        // set bases for evaluating a polynomial or monomial
        setBases(bases) {
            return this.setArrayProperty({
                name: 'bases',
                value: bases,
                defaultValue: []
            });
        }

        // set level of function (for generating level sets)
        setLevel(level) {
            return this.setNumericProperty({
                name: 'level',
                value: level,
                defaultValue: 0
            });
        }

        value(bases) {
            return 0;   // overridden by subclass
        }

        // Returns y value for given x, for a two-dimensional function
        yValue(x) {
            return 0;
        }

        // Returns x value for given y, for a two-dimensional function
        xValue(y) {
            return 0;
        }

        points(view, yIsIndependent, numSamplePoints) {

            var fn = this,
                points = [];

            numSamplePoints = numSamplePoints || 51;

            var xSamplePoints = view.xAxis.domain.samplePoints(numSamplePoints),
                ySamplePoints = view.yAxis.domain.samplePoints(numSamplePoints);

            for(var i = 0; i < numSamplePoints; i++) {
                var x = xSamplePoints[i];
                var yOfX = fn.yValue(x);
                if(view.yAxis.domain.contains(yOfX)) {
                    points.push({x: x, y: yOfX})
                }
                var y = ySamplePoints[i];
                var xOfY = fn.xValue(y);
                if(view.xAxis.domain.contains(xOfY)) {
                    points.push({x: xOfY, y: y})
                }
            }

            if (yIsIndependent) {
                return points.sort(KG.sortObjects('y'));
            } else {
                return points.sort(KG.sortObjects('x'));
            }

        }
    }

}