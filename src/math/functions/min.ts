module KGMath.Functions {

    export interface MinDefinition extends BaseDefinition {
        minimandDefs: {type: string; def: KGMath.Functions.BaseDefinition}[]
    }

    export interface IMin extends IBase {
        minimands: KGMath.Functions.Base[];
    }

    export class Min extends Base implements IMin {

        public minimands;

        constructor(definition:MinDefinition, modelPath?: string) {
            super(definition, modelPath);

            var m = this;

            m.minimands = definition.minimandDefs.map(function(fnDef, index){
                return new KGMath.Functions[fnDef.type](fnDef.def, m.modelProperty('minimands['+index+']'));
            })

            console.log(m.minimands)
        }

        value(bases?) {

            var m = this;

            if(bases) {
                m.setBases(bases);
            }

            return Math.min.apply(null, m.minimands.map(function (minimand) {
                return minimand.value(m.bases)
            }))

        }

        // The derivative of a min function is the minimum of the derivative(s) of the component function(s)
        // whose value is the current minimum.

        // Note that the bases must be set for this to have any meaning.

        derivative(n,bases?) {

            var m = this,
                currentMinimumFunctions = [];

            if(bases) {
                m.setBases(bases);
            }

            // One or more functions have the current minimum value; create an array of those function(s).
            for (var i = 0; i < m.minimands.length; i++) {
                if (m.value() == m.minimands[i].value()) {
                    currentMinimumFunctions.push(m.minimands[i].derivative(n))
                }
            }

            // If there is a single function with the lowest value, return the derivative of that function.
            if(currentMinimumFunctions.length == 1) {
                return currentMinimumFunctions[0];
            }

            // Otherwise, find the function with the lowest derivative with respect to variable n
            var lowestDerivativeValue = Math.min.apply(null, currentMinimumFunctions.map(function (minimandDerivative) {
                return minimandDerivative.value();
            }));

            // and return that function
            for (var j = 0; j < currentMinimumFunctions.length; j++) {
                if (lowestDerivativeValue == currentMinimumFunctions[j].value()) {
                    return currentMinimumFunctions[j];
                }
            }
        }
    }

}