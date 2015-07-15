module KGMath.Functions {

    export interface IBase extends KG.IModel {
        value: (any) => number;
        slope: (a: number, b?: number, inverse?: boolean) => number;
    }

    export class Base extends KG.Model {

        constructor(definition) {
            super(definition);
        }

        value(input) {
            return 0;
        }

        slope(a,b,inverse) {

            b = b || 0;
            inverse = inverse || false;

            var fa = this.value(a),
                fb = this.value(b);

            var s = (fa - fb)/(a - b);

            return inverse ? 1/s : s;
        }
    }

}