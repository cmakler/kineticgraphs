/// <reference path="../eg.ts"/>

'use strict';

module EconGraphs {

    export interface MidpointElasticityDefinition extends ElasticityDefinition
    {
        point1: KG.ICoordinates;
        point2: KG.ICoordinates;
    }

    export interface IMidpointElasticity extends IElasticity
    {
        point1: KG.ICoordinates;
        point2: KG.ICoordinates;
        point1view: KG.Point;
        point2view: KG.Point;
        xDiff: number;
        yDiff: number;
        xAvg: number;
        yAvg: number;
        xPercentDiff: number;
        yPercentDiff: number;
        line: KG.Line;
    }

    export class MidpointElasticity extends Elasticity implements IMidpointElasticity
    {
        public point1;
        public point2;
        public point1view;
        public point2view;
        public midpoint;
        public xDiff;
        public yDiff;
        public xAvg;
        public yAvg;
        public xPercentDiff;
        public yPercentDiff;
        public xDiffSegment;
        public yDiffSegment;
        public line;

        constructor(definition:MidpointElasticityDefinition) {
            super(definition);
            this.point1view = new KG.Point({
                name: 'point1',
                coordinates: definition.point1,
                size: 500,
                xDrag: true,
                yDrag: true,
                label: {
                    text: 'B'
                },
                droplines: {
                    horizontal: 'P_B',
                    vertical: 'Q_B'
                }
            });
            this.point2view = new KG.Point({
                name: 'point2',
                coordinates: definition.point2,
                size: 500,
                xDrag: true,
                yDrag: true,
                label: {
                    text: 'A'
                },
                droplines: {
                    horizontal: 'P_A',
                    vertical: 'Q_A'
                }
            });
            this.midpoint = new KG.Point({
                name: 'midpoint',
                coordinates: {
                    x: 'model.xAvg',
                    y: 'model.yAvg'},
                symbol: 'cross',
                color: 'grey',
                size: 100,
                xDrag: false,
                yDrag: false,
                label: {
                    text: 'M',
                    align: 'right',
                    valign: 'top',
                    color: 'grey'
                }
            });
            this.line = new KG.Line({
                name: 'demand',
                color: 'purple',
                arrows: 'NONE',
                a: {
                    x: 'params.x1',
                    y: 'params.y1'
                },
                b: {
                    x: 'params.x2',
                    y: 'params.y2'
                }
            });
            this.xDiffSegment = new KG.Segment({
                name: 'xDiffSegment',
                color: 'blue',
                arrows: 'END',
                a: {
                    x: definition.point2.x,
                    y: 5
                },
                b: {
                    x: definition.point1.x,
                    y: 5
                },
                label: {
                    text: 'model.xPercentDiff | percentage:0',
                    valign: 'top'
                }
            });
            this.yDiffSegment = new KG.Segment({
                name: 'yDiffSegment',
                color: 'red',
                arrows: 'END',
                a: {
                    x: 15,
                    y: definition.point2.y
                },
                b: {
                    x: 15,
                    y: definition.point1.y
                },
                label: {
                    text: 'model.yPercentDiff | percentage:0',
                    align: 'right'
                }
            });
        }

        _update(scope) {

            var e = this;

            e.xDiff = e.point1.x - e.point2.x;
            e.yDiff = e.point1.y - e.point2.y;
            e.xAvg = 0.5*(e.point1.x + e.point2.x);
            e.yAvg = 0.5*(e.point1.y + e.point2.y);
            e.xPercentDiff = e.xDiff / e.xAvg;
            e.yPercentDiff = e.yDiff / e.yAvg;
            e.elasticity = e.xPercentDiff / e.yPercentDiff;

            return e.calculateElasticity();
        }
    }

}