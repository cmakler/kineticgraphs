/// <reference path="../../../eg.ts"/>

module EconGraphs {

    export interface EndowmentBudgetConstraintDefinition extends BudgetDefinition {
        endowment: any;
        px?: any;
        py?: any;
        pxBuy?: any;
        pyBuy?: any;
        pxSell?: any;
        pySell?: any;
    }

    export interface IEndowmentBudgetConstraint extends IBudget {
        endowment: number;
        px: number;
        py: number;
        pxBuy: number;
        pyBuy: number;
        pxSell: number;
        pySell: number;
        budgetLine: KG.Line;
    }

    export class EndowmentBudgetConstraint extends Budget implements IEndowmentBudgetConstraint {

        public endowment;
        public px;
        public py;
        public pxBuy;
        public pyBuy;
        public pxSell;
        public pySell;
        public budgetLine;

        constructor(definition: EndowmentBudgetConstraintDefinition, modelPath: string) {

            if(definition.hasOwnProperty('px')) {
                definition.pxBuy = definition.px;
                definition.pxSell = definition.px;
            }

            if(definition.hasOwnProperty('py')) {
                definition.pyBuy = definition.py;
                definition.pySell = definition.py;
            }

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
                    endowment: definition.endowment,
                    px: definition.pxSell,
                    py: definition.pyBuy,
                    xMin: 0,
                    xMax: definition.endowment.x
                }, b.modelProperty('budgetSegments[0]')),
                new BudgetSegment({
                    endowment: definition.endowment,
                    px: definition.pxBuy,
                    py: definition.pySell,
                    yMin: 0,
                    yMax: definition.endowment.y
                }, b.modelProperty('budgetSegments[1]'))
            ];

            b.budgetLine = new KG.PiecewiseLinear({
                name: 'BL',
                className: 'budget',
                sections: b.modelProperty('budgetSegments'),
                xInterceptLabel: definition.xInterceptLabel,
                yInterceptLabel: definition.yInterceptLabel,
                params: params
            }, b.modelProperty('budgetLine'));

        }

    }

}