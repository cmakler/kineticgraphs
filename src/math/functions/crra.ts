module KGMath.Functions {

    export interface CRRADefinition extends BaseDefinition {
        rho?: any;
    }

    export interface ICRRA extends IBase {
        definition: CRRADefinition;
        rho: number;
    }

    export class CRRA extends Base implements ICRRA {

        public definition;
        public rho;

        constructor(definition:CRRADefinition, modelPath?: string) {
            super(definition, modelPath);
        }

        value(bases) {
            var u = this;

            if(bases) {
                u.setBases(bases)
            }

            if(u.rho == 1) {
                return Math.log(u.bases[0])
            } else {
                return (Math.pow(u.bases[0],1-u.rho) - 1) / (1 - u.rho)
            }
        }

        yValue(x) {
            return this.value([x]);
        }

        // Returns x value for given y, for a two-dimensional function
        xValue(y) {
            var u = this;
            if(u.rho == 1) {
                return Math.exp(y);
            } else {
                return Math.pow(y*(1 - u.rho) + 1,1/(1-u.rho));
            }
        }

        derivative(n) {
            var u = this;
            return new Monomial({
                // the new coefficient is the old coefficient times
                //the power of the variable whose derivative we're taking
                coefficient: 1,

                powers: [KG.subtractDefs(0,u.definition.rho)],

                bases: u.bases
            })
        }

    }

}