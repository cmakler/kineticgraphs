/// <reference path="../../../eg.ts"/>

'use strict';

module EconGraphs {

    export interface QuadraticMarginalCostDefinition extends ProductionCostDefinition
    {
        marginalCostVertexCoordinates: KG.ICoordinates;
        marginalCostControlPointCoordinates: KG.ICoordinates;
    }

    export interface IQuadraticMarginalCost extends IProductionCost
    {
        marginalCostVertex: KG.Point;
        marginalCostControlPoint: KG.Point;
    }

    export class QuadraticMarginalCost extends ProductionCost implements IQuadraticMarginalCost
    {
        public marginalCostVertex;
        public marginalCostControlPoint;

        constructor(definition:QuadraticMarginalCostDefinition, modelPath?: string) {

            definition.marginalCostFunctionType = 'Quadratic';
            definition.marginalCostFunctionDef = {
                vertex: definition.marginalCostVertexCoordinates,
                point: definition.marginalCostControlPointCoordinates
            };

            super(definition,modelPath);

            var productionCost = this;

            productionCost.marginalCostVertex = new KG.Point({
                name: 'marginalCostVertexPoint',
                className: 'marginalCost',
                coordinates: definition.marginalCostVertexCoordinates,
                xDrag: definition.marginalCostVertexCoordinates.x,
                yDrag: definition.marginalCostVertexCoordinates.y
            });

            productionCost.marginalCostControlPoint = new KG.Point({
                name: 'marginalCostControlPoint',
                className: 'marginalCost',
                coordinates: definition.marginalCostControlPointCoordinates,
                xDrag: definition.marginalCostControlPointCoordinates.x,
                yDrag: definition.marginalCostControlPointCoordinates.y
            })

        }

    }

}