/* 
 A polynomial function is an array of monomial functions.
 Its value is the sum of its component functions.
 Its derivative is the array of the derivatives of its component functions.
 */

module KGMath.Functions {

    export interface PolynomialDefinition extends BaseDefinition {
        terms?: Monomial[];
        termDefs?: any;
    }

    export interface IPolynomial extends IBase {
        terms: Monomial[];
        setCoefficient: (term:number, coefficient:number) => any;
        setPowers: (term:number, powers: number[]) => any;
        bases: number[];
        value: (bases?: number[]) => number;
        derivative: (n:number) => Polynomial;
        average: (n:number) => Polynomial;
        add: (x: number) => Polynomial;
        multiply: (x: number) => Polynomial;
    }

    export class Polynomial extends Base implements IPolynomial {

        public terms;

        constructor(definition:PolynomialDefinition) {
            super(definition);
            if(definition.hasOwnProperty('termDefs')){
                this.terms = definition.termDefs.map(function(termDef) { return new Monomial(termDef)});
            }
            this.bases = [0];

        }

        _update(scope) {
            this.terms.forEach(function(monomial) {monomial.update(scope)});
            return this;
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

        // The derivative of a polynomial is a new polynomial,
        // each of whose terms is the derivative of the original polynomial's terms
        derivative(n) {
            var p = this;
            return new Polynomial({
                termDefs: p.terms.map(
                    function (term) {
                        return term.derivative(n)
                    }
                )
            })
        }

        // The derivative of a polynomial is a new polynomial,
        // each of whose terms is the integral of the original polynomial's terms,
        // plus the constant of integration c
        integral(n,c?) {
            var p = this;
            if(!c) {
                c = 0;
            }
            var termDefs = p.terms.map(
                function (term) {
                    return term.integral(n)
                }
            );
            termDefs.push(new Monomial({coefficient: c, powers: [0]}))
            return new Polynomial({
                termDefs: termDefs
            });
        }

        // The average of a polynomial is a new polynomial,
        // each of whose terms is the average of the original polynomial's terms
        average(n) {
            var p = this;
            return new Polynomial({
                termDefs: p.terms.map(
                    function (term) {
                        return term.average(n)
                    }
                )
            })
        }

        // Multiplying a polynomial by a constant means multiplying each monomial by that constant
        multiply(x) {
            var p = this;
            return new Polynomial({
                termDefs: p.terms.map(
                    function (term) {
                        return term.multiply(x)
                    }
                )
            })
        }

        // Adding a constant to a polynomial means appending a new constant term
        add(x) {
            var p = this;
            var termDefs = p.terms;
            termDefs.push(new Monomial({coefficient: x, powers:[0]}))
            return new Polynomial({
                termDefs: termDefs
            });
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

