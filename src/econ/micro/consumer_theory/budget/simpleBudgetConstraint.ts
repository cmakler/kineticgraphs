/// <reference path="../../../eg.ts"/>

module EconGraphs {

    export interface SimpleBudgetConstraintDefinition extends BudgetDefinition {
        income?: any;
        endowment?: any;
        px: any;
        py: any;
    }

    export interface ISimpleBudgetConstraint extends IBudget {
        income: number;
        px: number;
        py: number;
        budgetLine: KG.Line;
    }

    export class SimpleBudgetConstraint extends Budget implements ISimpleBudgetConstraint {

        public income;
        public px;
        public py;
        public budgetLine;

        constructor(definition: SimpleBudgetConstraintDefinition, modelPath: string) {
            super(definition,modelPath);

            var b = this;

            var params:KG.LineParamsDefinition = {};
            if(definition.hasOwnProperty('budgetConstraintLabel')) {
                params.label = definition.budgetConstraintLabel;
            }
            if(definition.hasOwnProperty('budgetSetLabel')) {
                params.areaUnderLabel = definition.budgetSetLabel;
            }

            b.budgetSegments = [
                new BudgetSegment({
                    income: definition.income,
                    px: definition.px,
                    py: definition.py
                }, b.modelProperty('budgetSegments[0]'))
            ];

            b.budgetLine = new KG.Line({
                name: 'BL',
                className: 'budget',
                linear: b.modelProperty('budgetSegments[0].linear'),
                xInterceptLabel: definition.xInterceptLabel,
                yInterceptLabel: definition.yInterceptLabel,
                params: params
            }, b.modelProperty('budgetLine'));

        }

    }

}