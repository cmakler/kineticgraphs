/* 
 A monomial function is a term of the form c(b1^p1)(b2^p2)...(bn^pn)
 where 'c' is the coefficient, 'bi' is the i'th base, and 'pi' is the i'th power.

 The initializing object, params, should be of the form

 params = {coefficient: (number), bases: (number or array), powers: (number or array)}

 Any of these parameters may be null initially and set later with the setters.
 */

module KGMath.Functions {

    export interface MonomialDefinition extends BaseDefinition {
        coefficient: any;
        powers: any[];
    }

    export interface IMonomial extends IBase {
        coefficient: number;
        setCoefficient: (coefficient:number) => any;
        powers: number[];
        setPowers: (powers: number[]) => any;
        bases: number[];
        value: (bases?: number[]) => number;
    }

    export class Monomial extends Base implements IMonomial {

        public coefficient;
        public powers;
        public bases;

        constructor(definition:MonomialDefinition) {
            super(definition);
        }

        // Establish setters
        setCoefficient(coefficient) {
            return this.setNumericProperty({
                name: 'coefficient',
                value: coefficient,
                defaultValue: 1
            });
        }

        setPowers(powers) {
            return this.setArrayProperty({
                name: 'powers',
                value: powers,
                defaultValue: []
            });
        }

        // Evaluate monomial for a given set of bases. If none are set, use m.bases.

        value(bases?:any[]) {
            var m = this;
            m.setBases(bases);

            var basePowerPairs = Math.min(m.bases.length, m.powers.length);

            var result = m.coefficient;
            for (var t = 0; t < basePowerPairs; t++) {
                result *= Math.pow(m.bases[t], m.powers[t]);
            }
            return result;
        }




    }

}