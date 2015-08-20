/// <reference path="../kg.ts"/>

'use strict';

module KG {

    export interface SegmentDefinition extends CurveDefinition {
        a: any;
        b: any;
    }

    export interface ISegment extends ICurve {
        a: ICoordinates;
        b: ICoordinates;
    }

    export class Segment extends Curve implements ISegment {

        public a;
        public b;

        constructor(definition:SegmentDefinition) {

            definition.data = [KG.getCoordinates(definition.a), KG.getCoordinates(definition.b)];

            super(definition);

            this.viewObjectClass = 'segment';
        }

    }

}