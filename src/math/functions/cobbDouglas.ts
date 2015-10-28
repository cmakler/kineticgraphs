
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

        constructor(definition:CobbDouglasDefinition, modelPath?: string) {

            definition.yPower = definition.yPower || KG.subtractDefs(1, definition.xPower);

            var monomialDef:MonomialDefinition = {
                coefficient: definition.coefficient,
                powers: [definition.xPower, definition.yPower]
            };

            super(monomialDef, modelPath);
        }

    }

}