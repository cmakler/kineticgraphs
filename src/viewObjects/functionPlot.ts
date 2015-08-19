/// <reference path="../kg.ts"/>

'use strict';

module KG {

    export interface FunctionPlotDefinition extends ViewObjectDefinition {
        fn: any;
        yIsIndependent?: boolean;
        interpolation?: boolean;
        numSamplePoints?: number;
    }

    export interface IFunctionPlot extends IViewObject {
        fn: any;
        f: KGMath.Functions.Base;
        yIsIndependent: boolean;
        numSamplePoints: number;
        interpolation: string;
        linePlot: KG.LinePlot;
    }

    export class FunctionPlot extends ViewObject implements IFunctionPlot {

        public fn;
        public f;
        public yIsIndependent;
        public interpolation;
        public linePlot;
        public numSamplePoints;

        constructor(definition:FunctionPlotDefinition) {

            definition = _.defaults(definition, {yIsIndependent: false, interpolation: 'linear', numSamplePoints: 51});
            super(definition);
            var linePlotDefinition:any = definition;
            linePlotDefinition.data = [];

            var fnPlot = this;
            fnPlot.linePlot = new KG.LinePlot(linePlotDefinition);
            if(this.fn instanceof KGMath.Functions.Base) {
                fnPlot.f = fnPlot.fn;
            } else if(typeof this.fn == 'function') {
                fnPlot.f = new KGMath.Functions.Base({yValue: fnPlot.fn})
            }
        }

        createSubObjects(view) {
            var p = this;
            //view.addObject(p.linePlot);
            return view;
        }

        render(view) {
            var p = this;
            if(p.fn instanceof KGMath.Functions.Base) {
                p.linePlot.data = p.fn.points(view,p.yIsIndependent,p.numSamplePoints);
            }

            view = p.linePlot.render(view);
            return view;
        }

    }

}