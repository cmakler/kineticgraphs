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
        fn: KGMath.Functions.Base;
        yIsIndependent: boolean;
        numSamplePoints: number;
        interpolation: string;
        linePlot: KG.LinePlot;
    }

    export class FunctionPlot extends ViewObject implements IFunctionPlot {

        public fn;
        public yIsIndependent;
        public interpolation;
        public linePlot;
        public numSamplePoints;

        constructor(definition:FunctionPlotDefinition) {

            definition = _.defaults(definition, {yIsIndependent: false, interpolation: 'linear', numSamplePoints: 51});
            super(definition);
            var linePlotDefinition:any = definition;
            linePlotDefinition.data = [];
            this.linePlot = new KG.LinePlot(linePlotDefinition);
        }

        createSubObjects(view) {
            var p = this;
            //view.addObject(p.linePlot);
            return view;
        }

        render(view) {
            var p = this;
            p.linePlot.data = p.fn.points(view,p.yIsIndependent,p.numSamplePoints);
            view = p.linePlot.render(view);
            return view;
        }

    }

}