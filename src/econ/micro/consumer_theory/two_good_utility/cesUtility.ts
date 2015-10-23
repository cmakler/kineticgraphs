/// <reference path="../../../eg.ts"/>

'use strict';

module EconGraphs {

    export interface CobbDouglasUtilityDefinition extends TwoGoodUtilityDefinition {
        coefficient?: any;
        r?: any;
        s?: any;
        alpha: any;

    }

    export interface ICobbDouglasUtility extends ITwoGoodUtility {
        coefficient?: number;
        r: number;
        s: number;
        alpha: number;
    }

    export class CobbDouglasUtility extends TwoGoodUtility implements ICobbDouglasUtility {

        public coefficient;
        public r;
        public s;
        public alpha;

        constructor(definition:CobbDouglasUtilityDefinition, modelPath?:string) {

            definition.type = 'CES';
            definition.def = {
                coefficient: definition.coefficient || 1,
                r: definition.r,
                alpha: definition.alpha
            };

            // Can defined with either r or s
            if(definition.hasOwnProperty('r')) {
                definition.s = KG.divideDefs(1,KG.subtractDefs(1,definition.r)); // s = 1/(1-r)
            } else if(definition.hasOwnProperty('s')) {
                definition.r = KG.divideDefs(KG.subtractDefs(definition.s,1),definition.s); // r = (s-1)/s
            } else {
                raise('must instantiate a CES utility function with either r or s')
            }

            super(definition, modelPath);

        }

        _unconstrainedOptimalX(budgetSegment:BudgetSegment) {
            var u = this;
            var n = budgetSegment.income * Math.pow(budgetSegment.px/u.alpha,-u.s),
                dx = Math.pow(u.alpha,u.s) * Math.pow(budgetSegment.px, 1-u.s),
                dy = Math.pow(1-u.alpha,u.s) * Math.pow(budgetSegment.py, 1-u.s);
            return n/(dx + dy);
        }

        lowestCostBundle(utilityConstraint:UtilityConstraint) {
            var u = this;

            var denominator = Math.pow(u.alpha, s) * Math.pow(px, 1 - s) + Math.pow(1 - u.alpha, u.s) * Math.pow(py, 1 - u.s),
                x_coefficient = Math.pow(px / u.alpha, -s) / denominator,
                y_coefficient = Math.pow(py / (1 - u.alpha), -s) / denominator,
                scale_factor = u.alpha*Math.pow(x_coefficient, u.r) + (1- u.alpha)*Math.pow(y_coefficient, u.r),

                c = Math.pow(utility/scale_factor, 1/ u.r);

            return c;

            return {
                x: Math.pow(theta,u.yShare)*utilityConstraint.u,
                y: Math.pow(1/theta,u.xShare)*utilityConstraint.u
            };
        }

    }
}

