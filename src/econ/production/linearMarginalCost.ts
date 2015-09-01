/// <reference path="../eg.ts"/>

module EconGraphs {

    export interface LinearMarginalCostDefinition extends ProductionCostDefinition
    {
        costFunction?: KGMath.Functions.BaseDefinition;
    }

    export interface ILinearMarginalCost extends IProductionCost
    {
        costFunction: KGMath.Functions.Base;
        totalCostCurve: KG.FunctionPlot;
    }

    export class LinearMarginalCost extends ProductionCost implements ILinearMarginalCost
    {
        public fixedCost;
        public costFunction;

        constructor(definition:LinearMarginalCostDefinition) {
            super(definition);

            this.totalCostCurve = new KG.FunctionPlot({
                fn: this.totalCost,
                className: 'totalCost',
                label: {
                    text: 'TC'
                }
            })
        }

        _update(scope) {

            var linearMarginalCost = this;

            linearMarginalCost.fixedCost = linearMarginalCost.totalCost(0);

            return linearMarginalCost;

        }

    }

}