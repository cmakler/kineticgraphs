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

            definition.type = 'Polynomial';
            if(typeof definition.rra == 'number') {
                definition.def = {
                    termDefs: [
                        {
                            coefficient: 1/(1-definition.rra),
                            powers: [1 - definition.rra]
                        },
                        {
                            coefficient: -1/(1-definition.rra),
                            powers:[0]
                        }
                    ]
                }
            } else if(typeof definition.rra == 'string') {
                definition.def = {
                    termDefs: [
                        {
                            coefficient: "1/(1-" + definition.rra + ")",
                            powers: ["1 - " + definition.rra]
                        },
                        {
                            coefficient: "-1/(1-" + definition.rra + ")",
                            powers:[0]
                        }
                    ]
                }
            }
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

        consumptionYieldingUtility(u) {
            var oneMinusRho = 1 - this.rra;
            return Math.pow(1 + oneMinusRho*u,1/oneMinusRho);
        }

    }

}