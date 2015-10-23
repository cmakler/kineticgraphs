/// <reference path="../../../eg.ts"/>

'use strict';

module EconGraphs {

    export interface CobbDouglasUtilityDefinition extends TwoGoodUtilityDefinition {
        coefficient?: any;
        xPower: any;
        yPower?: any;
        xShare?: any;
        yShare?: any;
    }

    export interface ICobbDouglasUtility extends ITwoGoodUtility {
        coefficient;
        xPower;
        yPower;
        xShare;
        yShare;
    }

    export class CobbDouglasUtility extends TwoGoodUtility implements ICobbDouglasUtility {

        public coefficient;
        public xPower;
        public yPower;
        public xShare;
        public yShare;

        constructor(definition:CobbDouglasUtilityDefinition, modelPath?:string) {

            if(definition.hasOwnProperty('yPower')) {
                var sumOfPowers = KG.addDefs(definition.xPower, definition.yPower);
                definition.xShare = KG.divideDefs(definition.xPower, sumOfPowers);
                definition.yShare = KG.divideDefs(definition.yPower, sumOfPowers);
            } else {
                definition.yPower = KG.subtractDefs(1,definition.xPower);
                definition.xShare = definition.xPower;
                definition.yShare = definition.yPower;
            }

            definition.type = 'CobbDouglas';
            definition.def = {
                    coefficient: definition.coefficient || 1,
                    xPower: definition.xPower,
                    yPower: definition.yPower
            };

            super(definition, modelPath);

        }

        _unconstrainedOptimalX(budgetSegment:BudgetSegment) {
            return this.xShare * budgetSegment.income/budgetSegment.px;
        }

        lowestCostBundle(utilityConstraint:UtilityConstraint) {
            var u = this;

            var theta = (u.xShare/u.yShare)*utilityConstraint.py/utilityConstraint.px;

            return {
                x: Math.pow(theta,u.yShare)*utilityConstraint.u,
                y: Math.pow(1/theta,u.xShare)*utilityConstraint.u
            };
        }

    }
}

