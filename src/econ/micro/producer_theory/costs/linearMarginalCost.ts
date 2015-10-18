/// <reference path="../../../eg.ts"/>

'use strict';

module EconGraphs {

    export interface LinearMarginalCostDefinition extends ProductionCostDefinition
    {
        marginalCostIntercept: string;
        marginalCostControlPointCoordinates: KG.ICoordinates;
    }

    export interface ILinearMarginalCost extends IProductionCost
    {
        marginalCostInterceptPoint: KG.Point;
        marginalCostControlPoint: KG.Point;
    }

    export class LinearMarginalCost extends ProductionCost implements ILinearMarginalCost
    {
        public marginalCostInterceptPoint;
        public marginalCostControlPoint;

        constructor(definition:LinearMarginalCostDefinition, modelPath?: string) {

            definition.marginalCostFunctionType = 'Linear';
            definition.marginalCostFunctionDef = {
                point1: {x: 0, y: definition.marginalCostIntercept},
                point2: definition.marginalCostControlPointCoordinates
            };

            super(definition,modelPath);

            var productionCost = this;

            productionCost.marginalCostInterceptPoint = new KG.Point({
                name: 'marginalCostInterceptPoint',
                className: 'marginalCost',
                coordinates: {x: 0, y: definition.marginalCostIntercept},
                yDrag: definition.marginalCostIntercept
            });

            productionCost.marginalCostControlPoint = new KG.Point({
                name: 'marginalCostControlPoint',
                className: 'marginalCost',
                coordinates: definition.marginalCostControlPointCoordinates,
                yDrag: definition.marginalCostControlPointCoordinates.y
            })

        }

    }

}