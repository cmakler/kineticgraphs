/// <reference path="../kg.ts"/>

'use strict';

module KG {

    export interface FunctionPlotDefinition extends CurveDefinition {
        fn: any;
        yIsIndependent?: boolean;
        numSamplePoints?: number;
    }

    export interface IFunctionPlot extends ICurve {
        fn: any;
        f: KGMath.Functions.Base;
        yIsIndependent: boolean;
        numSamplePoints: number;
    }

    export class FunctionPlot extends Curve implements IFunctionPlot {

        public fn;
        public f;
        public yIsIndependent;
        public numSamplePoints;

        constructor(definition:FunctionPlotDefinition) {

            definition = _.defaults(definition, {yIsIndependent: false, interpolation: 'linear', numSamplePoints: 51});
            super(definition);
            var fnPlot = this;
            if(this.fn instanceof KGMath.Functions.Base) {
                fnPlot.f = fnPlot.fn;
            } else if(typeof this.fn == 'function') {
                fnPlot.f = new KGMath.Functions.Base({yValue: fnPlot.fn})
            }
        }

        updateDataForView(view) {
            var p = this;
            if(p.fn instanceof KGMath.Functions.Base) {
                p.data = p.fn.points(view,p.yIsIndependent,p.numSamplePoints);
            }
            return p;
        }

    }

}