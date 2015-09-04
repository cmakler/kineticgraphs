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
        levelCurve: (n:number, level?:number) => Monomial;
        derivative: (n:number) => Monomial;
    }

    export class Monomial extends Base implements IMonomial {

        public coefficient;
        public powers;
        public bases;
        public monomialDefs: any;

        constructor(definition:MonomialDefinition) {
            this.monomialDefs = {
                coefficient: definition.coefficient.toString(),
                powers: definition.powers.map(function(p) {return p.toString()})
            }
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

        // Return the monomial that is the derivative of this monomial
        // with respect to the n'th variable
        derivative(n) {

            var m = this;

            // n is the index of the term; first term by default
            n = n - 1 || 0;

            return new Monomial({

                // the new coefficient is the old coefficient times
                //the power of the variable whose derivative we're taking
                coefficient: "(" + m.monomialDefs.coefficient + ")*(" + m.monomialDefs.powers[n] + ")",

                powers: m.monomialDefs.powers.map(function (p, index) {
                    if (index == n) {
                        return p + "-1";
                    } else {
                        return p
                    }
                }),

                bases: m.bases

            })
        }

        // Return the monomial that solves the function c(b1^p1)(b2^p2) = level for bn
        // For example, to find the level curve where 3(x^2)(y^3) = 6 and express it as y(x), this would return
        // y = [6/(3x^-2)]^(1/3) = [(6/2)^1/3][(x^-2)^1/3] = [(6/2)^1/3][x^-2/3]
        // Note that the indices of the bases in the returned monomial are the same as the original.
        levelCurve (n?, level?) {

            var m = this;

            // note: level can be a numerical value or an array of bases at which to evaluate the monomial
            if (level) {
                m.setLevel(level);
            }

            // n is the index of the term; first term by default
            n = n - 1 || 0;

            // pn is the power to which the base variable we're solving for is raised
            var pn = m.powers[n];

            if (pn == 0) {
                return null;
            }

            return new Monomial({

                // the coefficient of the new monomial is (level/c)^1/p
                coefficient: Math.pow(m.level / m.coefficient, 1 / pn),

                // each of the powers for the remaining bases is divided by -p
                powers: m.powers.map(function (p, index) {
                    if (index == n) {
                        return 0;
                    } else {
                        return -p / pn;
                    }
                }),

                bases: m.bases

            })

        }

        // returns the y value corresponding to the given x value for m(x,y) = m.level
        yValue(x) {
            var m = this;
            if(m.powers.length == 1) {
                return m.coefficient * Math.pow(x,m.powers[0]);
            } else {
                this.setBase(1,x);
                return this.levelCurve(2).value();
            }

        }

        // returns the x value corresponding to the given y value for m(x,y) = m.level
        xValue(y) {
            var m = this;
            if(this.powers.length == 1) {
                return Math.pow(y/m.coefficient,1/m.powers[0]);
            } else {
                this.setBase(2,y);
                return this.levelCurve(1).value();
            }
        }

    }

}