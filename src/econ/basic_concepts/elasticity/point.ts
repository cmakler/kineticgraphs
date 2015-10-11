/// <reference path="../../eg.ts"/>

'use strict';

module EconGraphs {

    export interface PointElasticityDefinition extends ElasticityDefinition
    {
        point?: KG.ICoordinates;
        slope?: any;
    }

    export interface IPointElasticity extends IElasticity
    {
        point: KG.ICoordinates;
        slope: number;
        pointView: KG.Point;
        line: KG.Line;
    }

    export class PointElasticity extends Elasticity implements IPointElasticity
    {
        public point;
        public slope;
        public pointView;
        public line;

        constructor(definition:PointElasticityDefinition, modelPath?:string) {
            super(definition,modelPath);
            this.pointView = new KG.Point({
                name: 'point',
                coordinates: definition.point,
                size: 500,
                xDrag: true,
                yDrag: true,
                droplines: {
                    horizontal: 'P',
                    vertical: 'Q'
                }
            });
            this.line = new KGMath.Functions.Linear({
                point: definition.point,
                slope: definition.slope
            })
        }

        _calculateElasticity(inputs) {
            var e= this;
            if(inputs) {
                if(inputs.hasOwnProperty('point')) {
                    e.point = inputs.point;
                }
                if(inputs.hasOwnProperty('slope')) {
                    e.slope = inputs.slope;
                }
            }
            e.elasticity = (e.point.y / e.point.x)/e.slope;
            return e;
        }

    }

}