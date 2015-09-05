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
        totalCostCurve: KG.FunctionPlot;
        marginalCostFunction: KGMath.Functions.Base;
        marginalCostCurve: KG.FunctionPlot;
        averageCostFunction: KGMath.Functions.Base;
        averageCostCurve: KG.FunctionPlot;


    }

    export class ProductionCost extends KG.Model implements IProductionCost
    {
        public costFunction;
        public totalCostCurve;
        public marginalCostFunction;
        public marginalCostCurve;
        public averageCostFunction;
        public averageCostCurve;

        constructor(definition:ProductionCostDefinition) {
            super(definition);

            var productionCost = this;

            productionCost.costFunction = new KGMath.Functions[definition.costFunctionType](definition.costFunctionDef);
            productionCost.totalCostCurve = new KG.FunctionPlot({
                name: 'totalCostCurve',
                fn: this.modelProperty('costFunction'),
                className: 'totalCost',
                numSamplePoints:201,
                label: {
                    text: 'TC'
                }
            });

            productionCost.marginalCostFunction = productionCost.costFunction.derivative();
            productionCost.marginalCostCurve = new KG.FunctionPlot({
                name: 'marginalCostFunction',
                className: 'marginalCost',
                fn: productionCost.modelProperty('marginalCostFunction'),
                arrows: 'NONE',
                label: {
                    text: 'MC'
                }
            });

            productionCost.averageCostFunction = productionCost.costFunction.average();
            productionCost.averageCostCurve = new KG.FunctionPlot({
                name: 'averageCostFunction',
                className: 'averageCost',
                fn: productionCost.modelProperty('averageCostFunction'),
                arrows: 'NONE',
                label: {
                    text: 'ATC'
                },
                numSamplePoints: 501
            });
        }



    }

}