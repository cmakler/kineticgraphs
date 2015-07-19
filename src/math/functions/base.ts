module KGMath.Functions {

    export interface IBase extends KG.IModel {
        xValue: (x:number) => number;
        yValue: (y:number) => number;
        slopeBetweenPoints: (a: number, b?: number, inverse?: boolean) => number;
    }

    export class Base extends KG.Model {

        constructor(definition) {
            super(definition);
        }

        // Returns y value for given x, for a two-dimensional function
        yValue(x) {
            return 0;
        }

        // Returns x value for given y, for a two-dimensional function
        xValue(y) {
            return 0;
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
    }

}