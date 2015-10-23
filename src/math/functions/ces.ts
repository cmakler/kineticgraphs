module KGMath.Functions {

    export interface CESDefinition extends BaseDefinition {
        coefficient?: any;
        r?: any;
        s?: any;
        alpha?: any;
    }

    export interface ICES extends IBase {
        coefficient: number;
        r: number;
        s: number;
        alpha: number;
    }

    export class CES extends Base implements ICES {

        public coefficient;
        public r;
        public s;
        public alpha;

        constructor(definition:CESDefinition, modelPath?: string) {

            definition = _.defaults(definition,{
                coefficient: 1
            });

            super(definition, modelPath);
        }

        value(bases) {
            var u = this,
                xTerm = u.alpha*Math.pow(u.bases[0], u.r),
                yTerm = (1- u.alpha)*Math.pow(u.bases[1], u.r);
            return u.coefficient*Math.pow(xTerm + yTerm, 1/u.r);
        }

        yValue(x) {
            var u = this;

            var num = u.level - u.alpha * Math.pow(x, u.r),
                dem = 1 - u.alpha;

            return Math.pow(num/dem, 1/u.r);
        }

        // Returns x value for given y, for a two-dimensional function
        xValue(y) {
            var u = this;

            var num = u.level - (1 - u.alpha)*Math.pow(y, u.r),
                dem = u.alpha;

            return Math.pow(num/dem,1/u.r);
        }

    }

}