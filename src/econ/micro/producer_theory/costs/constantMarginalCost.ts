/// <reference path="../../../eg.ts"/>

'use strict';

module EconGraphs {

    export interface ConstantMarginalCostDefinition extends ProductionCostDefinition
    {
        c: any;
    }

    export interface IConstantMarginalCost extends IProductionCost
    {
        c: number;
    }

    export class ConstantMarginalCost extends ProductionCost implements IConstantMarginalCost
    {

        public c;

        constructor(definition:ConstantMarginalCostDefinition, modelPath?: string) {

            definition.marginalCostFunctionType = 'HorizontalLine';
            definition.marginalCostFunctionDef = {
                y: definition.c
            };

            super(definition,modelPath);

        }

    }

}