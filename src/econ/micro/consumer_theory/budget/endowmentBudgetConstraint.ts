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
        xLabel?: string;
        yLabel?: string;
    }

    export interface IEndowmentBudgetConstraint extends IBudget {
        endowment: number;
        px: number;
        py: number;
        pxBuy: number;
        pyBuy: number;
        pxSell: number;
        pySell: number;
        maxX: number;
        maxY: number;
        budgetLine: KG.Line;
        endowmentPoint: KG.Point;
    }

    export class EndowmentBudgetConstraint extends Budget implements IEndowmentBudgetConstraint {

        public endowment;
        public px;
        public py;
        public pxBuy;
        public pyBuy;
        public pxSell;
        public pySell;
        public maxX;
        public maxY;
        public budgetLine;
        public endowmentPoint;

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

            var pointParams:KG.PointParamsDefinition = {};
            if(definition.hasOwnProperty('xLabel')) {
                pointParams.xAxisLabel = definition.xLabel;
            }
            if(definition.hasOwnProperty('yLabel')) {
                pointParams.yAxisLabel = definition.yLabel;
            }

            b.endowmentPoint = new KG.Point({
                name: 'endowmentPoint',
                coordinates: definition.endowment,
                xDrag: definition.endowment.x,
                yDrag: definition.endowment.y,
                className: 'budget',
                params: pointParams
            });

            var lineParams:KG.LineParamsDefinition = {};
            if(definition.hasOwnProperty('budgetConstraintLabel')) {
                lineParams.label = definition.budgetConstraintLabel;
            }
            if(definition.hasOwnProperty('budgetSetLabel')) {
                lineParams.areaUnderLabel = definition.budgetSetLabel;
            }

            b.budgetSegments = [
                new BudgetSegment({
                    endowment: definition.endowment,
                    px: definition.pxSell,
                    py: definition.pyBuy,
                    xMin: 0,
                    xMax: definition.endowment.x,
                    yMin: definition.endowment.y
                }, b.modelProperty('budgetSegments[0]')),
                new BudgetSegment({
                    endowment: definition.endowment,
                    px: definition.pxBuy,
                    py: definition.pySell,
                    yMin: 0,
                    yMax: definition.endowment.y,
                    xMin: definition.endowment.x
                }, b.modelProperty('budgetSegments[1]'))
            ];

            b.budgetLine = new KG.PiecewiseLinear({
                name: 'BL',
                className: 'budget',
                sections: b.modelProperty('budgetSegments'),
                xInterceptLabel: definition.xInterceptLabel,
                yInterceptLabel: definition.yInterceptLabel,
                params: lineParams
            }, b.modelProperty('budgetLine'));

            b.maxX = b.modelProperty('budgetLine.xIntercept.toFixed(2)');
            b.maxY = b.modelProperty('budgetLine.yIntercept.toFixed(2)');

        }

    }

}