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
        sectionDefs?: KGMath.Functions.LinearDefinition[];
        sections?: KGMath.Functions.Linear[];
        arrows?: string;
        label?: GraphDivDefinition;
        xInterceptLabel?: string;
        yInterceptLabel?: string;
        params?: PiecewiseLinearParamsDefinition;
        areaUnderDef?: AreaDefinition;
        areaOverDef?: AreaDefinition;
    }

    export interface IPiecewiseLinear extends IViewObject {

        sections: KGMath.Functions.Linear[];
        labelDiv: GraphDiv;
        xInterceptLabelDiv: GraphDiv;
        yInterceptLabelDiv: GraphDiv;
        arrows: string;
        areaUnder: Area;
        areaOver: Area;
    }

    export class PiecewiseLinear extends ViewObject implements IPiecewiseLinear {

        public sections;
        public arrows;
        public labelDiv;
        public areaUnder;
        public areaOver;
        public xInterceptLabelDiv;
        public yInterceptLabelDiv;

        constructor(definition:PiecewiseLinearDefinition, modelPath?: string) {

            if(definition.hasOwnProperty('params')) {

                var p = definition.params;

                if(p.hasOwnProperty('label')) {
                    definition.label = {
                        text: p.label
                    }
                }

                if(p.hasOwnProperty('areaUnderLabel')) {
                    definition.areaUnderDef = {
                        name: definition.name + '_areaUnder',
                        className: definition.className,
                        label: {
                            text: p.areaUnderLabel
                        }
                    }
                }

                if(p.hasOwnProperty('areaOverLabel')) {
                    definition.areaOverDef = {
                        name: definition.name + 'areaOver',
                        className: definition.className,
                        label: {
                            text: p.areaOverLabel
                        }
                    }
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

            if(definition.label) {
                var labelDef:GraphDivDefinition = _.defaults(definition.label, {
                    name: definition.name + '_label',
                    className: definition.className,
                    xDrag: definition.xDrag,
                    yDrag: definition.yDrag,
                    color: definition.color,
                    show: definition.show
                });
                //console.log(labelDef);
                piecewiseLinear.labelDiv = new GraphDiv(labelDef);
            }

            if(definition.areaUnderDef) {
                piecewiseLinear.areaUnder = new Area(definition.areaUnderDef);
            }

            if(definition.areaOverDef) {
                piecewiseLinear.areaOver = new Area(definition.areaOverDef);
            }

            if(definition.hasOwnProperty('xInterceptLabel')) {
                var xInterceptLabelDef:GraphDivDefinition = {
                    name: definition.name + 'x_intercept_label',
                    color: definition.color,
                    text: definition.xInterceptLabel,
                    dimensions: {width: 30, height:20},
                    xDrag: definition.xDrag,
                    backgroundColor: 'white'
                };
                piecewiseLinear.xInterceptLabelDiv = new KG.GraphDiv(xInterceptLabelDef);
            }

            if(definition.hasOwnProperty('yInterceptLabel')) {
                var yInterceptLabelDef:GraphDivDefinition = {
                    name: definition.name + 'y_intercept_label',
                    color: definition.color,
                    text: definition.yInterceptLabel,
                    dimensions: {width: 30, height:20},
                    yDrag: definition.yDrag,
                    backgroundColor: 'white'
                };
                piecewiseLinear.yInterceptLabelDiv = new KG.GraphDiv(yInterceptLabelDef);
            }

        }

        _update(scope) {
            var piecewiseLinear = this;
            piecewiseLinear.sections.forEach(function(section){section.update(scope)});
            return this;
        }

        createSubObjects(view) {

            var piecewiseLinear = this;

            piecewiseLinear.sections.forEach(function(section, index){
                if(piecewiseLinear.labelDiv && index == piecewiseLinear.sections.length - 1){
                    var newLine = new Line({
                        name: piecewiseLinear.name + '_section' + index,
                        className: piecewiseLinear.className,
                        linear: section.linear,
                        xDomain: section.xDomain,
                        yDomain: section.yDomain,
                        label: piecewiseLinear.labelDiv});
                    view.addObject(newLine);
                    view.addObject(newLine.labelDiv);
                } else {
                    view.addObject(new Line({
                        name: piecewiseLinear.name + '_section' + index,
                        className: piecewiseLinear.className,
                        xDomain: section.xDomain,
                        yDomain: section.yDomain,
                        linear: section.linear
                    }))
                }
            });

            if(piecewiseLinear.xInterceptLabelDiv) {
                view.addObject(piecewiseLinear.xInterceptLabelDiv)
            }

            if(piecewiseLinear.yInterceptLabelDiv) {
                view.addObject(piecewiseLinear.yInterceptLabelDiv)
            }

            if(piecewiseLinear.labelDiv) {
                view.addObject(piecewiseLinear.labelDiv)
            }

            if(piecewiseLinear.areaUnder) {
                view.addObject(piecewiseLinear.areaUnder);
                view.addObject(piecewiseLinear.areaUnder.labelDiv);
            }

            return view;
        }

    }

}