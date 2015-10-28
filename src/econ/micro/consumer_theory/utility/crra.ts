/// <reference path="../../../eg.ts"/>

module EconGraphs {

    export interface ConstantRRADefinition extends OneGoodUtilityDefinition
    {
        rra: any;

    }

    export interface IConstantRRA extends IOneGoodUtility
    {
        rra: number;
        utilityFormula: (c? : number) => string;

    }

    export class ConstantRRA extends OneGoodUtility implements IConstantRRA
    {

        public rra;
        public show;

        constructor(definition:ConstantRRADefinition, modelPath?:string) {

            definition.type = 'CRRA';
            definition.def = {
                rho: definition.rra
            };
            super(definition, modelPath);

        }

        utilityFormula(c?) {
            var rra = this.rra;
            if(c) {
                if(rra==0) {
                    return c.toFixed(2) + '-1'
                } else if(rra.toFixed(2) ==1) {
                    return '\\log ' + c.toFixed(2)
                } else {
                    return "\\frac{" + c.toFixed(2) + "^{" + (1 -rra).toFixed(2) + "} - 1}{ " + (1 -rra).toFixed(2) + " } "
                }
            } else {
                if(rra==0) {
                    return 'c - 1'
                } else if(rra.toFixed(2) ==1) {
                    return '\\log c'
                } else {
                    return "\\frac{c^{" + (1 -rra).toFixed(2) + "} - 1}{ " + (1 -rra).toFixed(2) + " } "
                }
            }
        }

    }

}