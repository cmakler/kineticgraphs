/// <reference path="../kg.ts"/>

'use strict';

module KG {

    export interface ArrowDefinition extends CurveDefinition {
        begin: any;
        end: any;
    }

    export interface IArrow extends ICurve {
        begin: ICoordinates;
        end: ICoordinates;
    }

    export class Arrow extends Curve implements IArrow {

        public begin;
        public end;

        constructor(definition:ArrowDefinition) {

            definition.data = [KG.getCoordinates(definition.begin), KG.getCoordinates(definition.end)];
            definition.arrows = "END";

            super(definition);

            this.viewObjectClass = 'arrow';
        }

    }

}