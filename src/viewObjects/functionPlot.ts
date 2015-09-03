/// <reference path="../kg.ts"/>

'use strict';

module KG {

    export interface FunctionPlotDefinition extends CurveDefinition {
        fn: any;
        yIsIndependent?: boolean;
        numSamplePoints?: number;
    }

    export interface IFunctionPlot extends ICurve {
        fn: KGMath.Functions.Base;
        yIsIndependent: boolean;
        numSamplePoints: number;
    }

    export class FunctionPlot extends Curve implements IFunctionPlot {

        public fn;
        public yIsIndependent;
        public numSamplePoints;

        constructor(definition:FunctionPlotDefinition) {
            definition = _.defaults(definition, {yIsIndependent: false, interpolation: 'linear', numSamplePoints: 51});
            super(definition);
        }

        updateDataForView(view) {
            var p = this;
            p.data = p.fn.points(view,p.yIsIndependent,p.numSamplePoints);
            return p;
        }

    }

}