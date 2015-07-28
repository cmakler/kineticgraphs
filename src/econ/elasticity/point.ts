/// <reference path="../eg.ts"/>

'use strict';

module EconGraphs {

    export interface PointElasticityDefinition extends ElasticityDefinition
    {
        point: KG.ICoordinates;
        slope: any;
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

        constructor(definition:PointElasticityDefinition) {
            super(definition);
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
            this.line = new KGMath.Functions.PointSlopeLine({
                p: definition.point,
                m: definition.slope
            })
        }

        _update(scope) {

            var e = this;

            e.elasticity = (e.point.x / e.point.y)*e.slope;

            return e.calculateElasticity();
        }
    }

}