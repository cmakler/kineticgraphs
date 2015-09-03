/// <reference path="../eg.ts"/>

'use strict';

module EconGraphs {

    export interface ProductionCostDefinition extends KG.ModelDefinition
    {
        costFunctionType?: string;
        costFunctionDef?: KGMath.Functions.BaseDefinition;
    }

    export interface IProductionCost extends KG.IModel
    {
        costFunction: KGMath.Functions.Base;

        totalCost: (quantity:number) => number;
        averageTotalCost: (quantity:number) => number;
        fixedCost: number;
        averageFixedCost: (quantity:number) => number;
        variableCost: (quantity:number) => number;
        averageVariableCost: (quantity:number) => number;
        marginalCost: (quantity:number) => number;

        totalCostCurve: KG.FunctionPlot;
        averageTotalCostCurve: KG.FunctionPlot;
        fixedCostLine: KG.Line;
        averageFixedCostCurve: KG.FunctionPlot;
        variableCostCurve: KG.FunctionPlot;
        averageVariableCostCurve: KG.FunctionPlot;
        marginalCostCurve: KG.FunctionPlot;
        averageMarginalCostCurve: KG.FunctionPlot;
    }

    export class ProductionCost extends KG.Model implements IProductionCost
    {
        public totalCost;
        public fixedCost;
        public costFunction;
        public totalCostCurve;
        public averageTotalCostCurve;
        public fixedCostLine;
        public averageFixedCostCurve;
        public variableCostCurve;
        public averageVariableCostCurve;
        public marginalCostCurve;
        public averageMarginalCostCurve;

        constructor(definition:ProductionCostDefinition) {
            super(definition);

            this.costFunction = new KGMath.Functions[definition.costFunctionType](definition.costFunctionDef);

            this.totalCostCurve = new KG.FunctionPlot({
                name: 'totalCostCurve',
                fn: this.modelProperty('costFunction'),
                className: 'totalCost',
                numSamplePoints:201,
                label: {
                    text: 'TC'
                }
            })



        }

        _update(scope) {

            var productionCost = this;
            productionCost.totalCost = function(quantity) {return productionCost.costFunction.yValue(quantity)};
            productionCost.fixedCost = productionCost.totalCost(0);
            return productionCost;
        }

        averageTotalCost(quantity) {
            return this.totalCost(quantity)/quantity;
        }

        averageFixedCost(quantity) {
            return this.fixedCost/quantity;
        }

        variableCost(quantity) {
            return this.totalCost(quantity) - this.fixedCost;
        }

        averageVariableCost(quantity) {
            return this.variableCost(quantity)/quantity;
        }

        marginalCost(quantity) {
            var costFunction = this.costFunction;
            if(costFunction.hasOwnProperty('derivative')) {
                return costFunction.derivative.yValue(quantity);
            } else {
                return quantity > 0 ? costFunction.slopeBetweenPoints(quantity, 1.01*quantity) : costFunction.slopeBetweenPoints(quantity,0.01);
            }
        }

        averageMarginalCost(quantity) {
            return this.marginalCost(quantity)/quantity;
        }

    }

}