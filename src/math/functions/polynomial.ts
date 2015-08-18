/* 
 A polynomial function is an array of monomial functions.
 Its value is the sum of its component functions.
 Its derivative is the array of the derivatives of its component functions.
 */

module KGMath.Functions {

    export interface PolynomialDefinition extends BaseDefinition {
        terms: any;
    }

    export interface IPolynomial extends IBase {
        terms: Monomial[];
        setCoefficient: (term:number, coefficient:number) => any;
        setPowers: (term:number, powers: number[]) => any;
        bases: number[];
        value: (bases?: number[]) => number;
        derivative: (n:number) => Polynomial;
    }

    export class Polynomial extends Base implements IPolynomial {

        public terms;

        constructor(definition:PolynomialDefinition) {
            super(definition);
            this.bases = [0];
        }

        // The coefficients and powers of each term may be get and set via the term's index
        setCoefficient(n, coefficient) {
            var p = this;
            p.terms[n-1].setCoefficient(coefficient);
            return p;
        }

        setPowers(n, powers) {
            var p = this;
            p.terms[n-1].setPowers(powers);
            return p;
        }

        // The value of a polynomial is the sum of the values of its monomial terms
        value(bases) {

            var p = this;

            p.setBases(bases);
            var result = 0;
            for(var i=0; i<p.terms.length; i++) {
                result += p.terms[i].value(p.bases);
            }
            return result;
        }

        // The derivative of a polynomial is a new polynomial, each of whose terms is the derivative of the original polynomial's terms
        derivative(n) {
            var p = this;
            return new Polynomial({terms: p.terms.map(
                function(term) { return term.derivative(n)}
            )});
        }

        // Assume all bases except the first have been set; replace the base of the first variable ('x') with the x value
        yValue(x) {
            var p = this;
            var inputs = p.bases.map(function(val,index) { return (index == 0) ? x : val});
            return p.value(inputs);
        }

        // Not generally a valid concept for a polynomial
        xValue(y) {
            return null;
        }
    }

}

