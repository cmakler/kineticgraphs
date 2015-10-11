/// <reference path="../../../eg.ts"/>

module EconGraphs {

    export interface BudgetDefinition extends KG.ModelDefinition {
        budgetSegmentDefinitions: BudgetSegmentDefinition[];
        budgetConstraintLabel: string;
        budgetSetLabel: string;
        xInterceptLabel: string;
        yInterceptLabel: string;
    }

    export interface IBudget extends KG.IModel {

        budgetSegments: BudgetSegment[];
        isAffordable: (bundle:KG.ICoordinates) => boolean;
        budgetConstraintLabel: string;
        budgetSetLabel: string;
        xInterceptLabel: string;
        yInterceptLabel: string;
    }

    export class Budget extends KG.Model implements IBudget {

        public budgetSegments;
        public budgetConstraintLabel;
        public budgetSetLabel;
        public xInterceptLabel;
        public yInterceptLabel;

        constructor(definition:BudgetDefinition, modelPath?:string) {
            super(definition, modelPath);
        }

        _update(scope) {
            var b = this;
            b.budgetSegments.forEach(function(bs) {bs.update(scope)});
            return b;
        }

        isAffordable(bundle) {
            var b = this;
            for(var i = 0; i < b.budgetSegments.length; i++) {
                var bs = b.budgetSegments[i];
                if(bs.isAffordable(bundle)) {
                    return true;
                }
            }
            return false;
        }
    }
}