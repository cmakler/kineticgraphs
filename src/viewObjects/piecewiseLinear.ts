/// <reference path="../kg.ts"/>

'use strict';

module KG {

    export interface PiecewiseLinearParamsDefinition extends LineParamsDefinition {
        label?: string;
        yInterceptLabel?: string;
        xInterceptLabel?: string;
        areaUnderLabel?: string;
        areaOverLabel?: string;
    }

    export interface PiecewiseLinearDefinition extends ViewObjectDefinition {
        sectionDefs?: any;
        sections?: any;
        arrows?: string;
        label?: string;
        xInterceptLabel?: string;
        yInterceptLabel?: string;
        params?: PiecewiseLinearParamsDefinition;
        areaUnderLabel?: string;
        areaOverLabel?: string;
    }

    export interface IPiecewiseLinear extends IViewObject {

        label?: string;
        sections: KGMath.Functions.Linear[];
        xInterceptLabel: string;
        yInterceptLabel: string;
        arrows: string;
        areaUnderLabel?: string;
        areaOverLabel?: string;
        xIntercept: number;
        yIntercept: number;


    }

    export class PiecewiseLinear extends ViewObject implements IPiecewiseLinear {

        public sections;
        public arrows;
        public label;
        public areaUnderLabel;
        public areaOverLabel;
        public xInterceptLabel;
        public yInterceptLabel;
        public xIntercept;
        public yIntercept;

        constructor(definition:PiecewiseLinearDefinition, modelPath?: string) {

            if(definition.hasOwnProperty('params')) {

                var p = definition.params;

                if(p.hasOwnProperty('label')) {
                    definition.label = p.label;
                }

                if(p.hasOwnProperty('areaUnderLabel')) {
                    definition.areaUnderLabel = p.areaUnderLabel;
                }

                if(p.hasOwnProperty('areaOverLabel')) {
                    definition.areaOverLabel = p.areaOverLabel;
                }

                if(p.hasOwnProperty('xInterceptLabel')) {
                    definition.xInterceptLabel = p.xInterceptLabel;
                }

                if(p.hasOwnProperty('yInterceptLabel')) {
                    definition.yInterceptLabel = p.yInterceptLabel;
                }

            }

            super(definition, modelPath);

            var piecewiseLinear = this;

            if(definition.hasOwnProperty('sectionDefs')) {
                piecewiseLinear.sections = definition.sectionDefs.map(function (def) {
                    return new KGMath.Functions.Linear(def)
                });
            }

            piecewiseLinear.viewObjectSVGtype = 'path';
            piecewiseLinear.viewObjectClass = 'line';

        }

        _update(scope) {
            var piecewiseLinear = this;
            piecewiseLinear.sections.forEach(function(section){section.update(scope)});
            return this;
        }

        createSubObjects(view,scope) {

            var piecewiseLinear = this;

            piecewiseLinear.sections.forEach(function(section, index){
                if(index == 0){
                    var newLine = new Line({
                        name: piecewiseLinear.name + '_section' + index,
                        className: piecewiseLinear.className,
                        linear: section.linear,
                        xDomain: section.xDomain,
                        yDomain: section.yDomain,
                        params: {
                            yInterceptLabel: piecewiseLinear.yInterceptLabel
                        }
                    });
                    view.addObject(newLine.update(scope));
                    view = newLine.createSubObjects(view,scope);
                    piecewiseLinear.yIntercept = newLine.linear.yIntercept;
                } else if(index == piecewiseLinear.sections.length - 1){
                    var newLine = new Line({
                        name: piecewiseLinear.name + '_section' + index,
                        className: piecewiseLinear.className,
                        linear: section.linear,
                        xDomain: section.xDomain,
                        yDomain: section.yDomain,
                        params: {
                            label: piecewiseLinear.label,
                            xInterceptLabel: piecewiseLinear.xInterceptLabel
                        }
                    });
                    view.addObject(newLine.update(scope));
                    view = newLine.createSubObjects(view,scope);
                    piecewiseLinear.xIntercept = newLine.linear.xIntercept;
                } else {
                    var newLine = new Line({
                        name: piecewiseLinear.name + '_section' + index,
                        className: piecewiseLinear.className,
                        xDomain: section.xDomain,
                        yDomain: section.yDomain,
                        linear: section.linear
                    });
                    view.addObject(newLine.update(scope));
                }
            });

            return view;
        }

    }

}