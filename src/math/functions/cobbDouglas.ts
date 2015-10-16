/* 
 A monomial function is a term of the form c(b1^p1)(b2^p2)...(bn^pn)
 where 'c' is the coefficient, 'bi' is the i'th base, and 'pi' is the i'th power.

 The initializing object, params, should be of the form

 params = {coefficient: (number), bases: (number or array), powers: (number or array)}

 Any of these parameters may be null initially and set later with the setters.
 */

module KGMath.Functions {

    export interface CobbDouglasDefinition extends MonomialDefinition {
        xPower: any;
        yPower?: any;
    }

    export interface ICobbDouglas extends IMonomial {
        xPower: number;
        yPower: number;
    }

    export class CobbDouglas extends Monomial implements ICobbDouglas {

        public xPower;
        public yPower;

        constructor(definition:CobbDouglas, modelPath?: string) {

            definition.yPower = definition.yPower || KG.subtractDefs(1, definition.xPower);

            var monomialDef:MonomialDefinition = {
                coefficient: definition.coefficient,
                powers: [definition.xPower, definition.yPower]
            };

            super(monomialDef, modelPath);
        }

    }

}