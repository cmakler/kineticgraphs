/// <reference path="../../eg.ts"/>

'use strict';

module EconGraphs {

    export interface MidpointElasticityDefinition extends ElasticityDefinition
    {
        point1?: KG.ICoordinates;
        point2?: KG.ICoordinates;
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

        constructor(definition:MidpointElasticityDefinition, modelPath?:string) {
            super(definition, modelPath);
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
                className: 'demand',
                arrows: 'NONE',
                lineDef: {
                    point1: {
                        x: 'params.x1',
                        y: 'params.y1'
                    },
                    point2: {
                        x: 'params.x2',
                        y: 'params.y2'
                    }

                }
            });
            this.xDiffSegment = new KG.Arrow({
                name: 'xDiffSegment',
                className: 'diff2',
                begin: {
                    x: definition.point2.x,
                    y: 5
                },
                end: {
                    x: definition.point1.x,
                    y: 5
                },
                label: {
                    text: 'model.xPercentDiff | percentage:0',
                    valign: 'top',
                    align: 'center'
                }
            });
            this.yDiffSegment = new KG.Arrow({
                name: 'yDiffSegment',
                className: 'diff1',
                begin: {
                    x: 15,
                    y: definition.point2.y
                },
                end: {
                    x: 15,
                    y: definition.point1.y
                },
                label: {
                    text: 'model.yPercentDiff | percentage:0',
                    align: 'right'
                }
            });
        }

        _calculateElasticity(inputs) {
            var e = this;

            if(inputs) {
                if(inputs.hasOwnProperty('point1') && inputs.hasOwnProperty('point2')) {
                    e.point1 = inputs.point1;
                    e.point2 = inputs.point2;
                }
            }

            e.xDiff = e.point1.x - e.point2.x;
            e.yDiff = e.point1.y - e.point2.y;
            e.xAvg = 0.5*(e.point1.x + e.point2.x);
            e.yAvg = 0.5*(e.point1.y + e.point2.y);
            e.xPercentDiff = e.xDiff / e.xAvg;
            e.yPercentDiff = e.yDiff / e.yAvg;
            e.elasticity = e.xPercentDiff / e.yPercentDiff;

            console.log('calculating elasticity');

            return e;
        }

    }

}