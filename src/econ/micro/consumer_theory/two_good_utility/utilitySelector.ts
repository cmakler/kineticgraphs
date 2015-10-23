/// <reference path="../../../eg.ts"/>

'use strict';

module EconGraphs {

    export interface UtilitySelectorDefinition extends KG.ModelDefinition {
        coefficient: any;
        alpha: any;
        selected: string;
        type: string;
        def: any;
    }

    export interface IUtilitySelector extends KG.IModel {
        coefficient: number;
        alpha: number;
        selected: string;
        cobbDouglas: CobbDouglasUtility;
        complements: ComplementsUtility;
        selectedUtility: TwoGoodUtility;
    }

    export class UtilitySelector extends KG.Model implements IUtilitySelector {

        public coefficient;
        public alpha;
        public selected;
        public cobbDouglas;
        public complements;
        public selectedUtility;

        constructor(definition:UtilitySelectorDefinition, modelPath?:string) {

            definition = _.defaults(definition, {
                coefficient: 1,
                alpha: 0.5,
                selected: 'CobbDouglas',
            });

            var utilityDefinitions = {
                'CobbDouglas': {coefficient: definition.coefficient, xPower: definition.alpha},
                'Complements': {bundle: {x: definition.alpha, y: KG.subtractDefs(1, definition.alpha)}}
            };

            definition.type = definition.selected;
            definition.def = utilityDefinitions[definition.selected];

            super(definition, modelPath);

            var u = this;

            u.cobbDouglas = new CobbDouglasUtility(utilityDefinitions.CobbDouglas,u.modelProperty('utility'));

            u.complements = new ComplementsUtility(utilityDefinitions.Complements,u.modelProperty('utility'));

        }

        _update(scope) {
            var u = this;
            var selectedUtility = (u.selected == 'CobbDouglas') ? u.cobbDouglas : u.complements;
            u.selectedUtility = selectedUtility.update(scope);
            return u;
        }

    }
}

