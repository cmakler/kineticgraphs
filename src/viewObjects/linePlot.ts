/// <reference path="../kg.ts"/>

'use strict';

module KG {

    export interface ILinePlot extends ICurve {


    }

    export class LinePlot extends Curve implements ILinePlot {

        public data;
        public interpolation;

        constructor(definition) {

            super(definition);

            this.viewObjectSVGtype = 'path';
            this.viewObjectClass = 'dataPath';

        }

    }

}