/// <reference path="../../../eg.ts"/>

'use strict';

module EconGraphs {

    export interface CobbDouglasUtilityDefinition extends TwoGoodUtilityDefinition {
        coefficient?: any;
        xPower: any;
        yPower?: any;
    }

    export interface ICobbDouglasUtility extends ITwoGoodUtility {
        coefficient;
        xPower;
        yPower;
    }

    export class CobbDouglasUtility extends TwoGoodUtility implements ICobbDouglasUtility {

        public coefficient;
        public xPower;
        public yPower;

        constructor(definition:CobbDouglasUtilityDefinition, modelPath?:string) {

            definition.type = 'CobbDouglas';
            definition.def = {
                    coefficient: definition.coefficient || 1,
                    xPower: definition.xPower,
                    yPower: definition.yPower
            };

            super(definition, modelPath);

        }

    }
}

