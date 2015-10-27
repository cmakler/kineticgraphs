/// <reference path="../kg.ts"/>

'use strict';

module KG {

    export interface CurveParamsDefinition extends ViewObjectParamsDefinition {
        label?: string;
        labelPrefix?: string;
    }

    export interface CurveDefinition extends ViewObjectDefinition {
        data?: any;
        interpolation?: string;
        label?: GraphDivDefinition;
        labelPosition?: string;
        arrows?: string;
        params?: CurveParamsDefinition;
    }

    export interface ICurve extends IViewObject {

        data: ICoordinates[];
        interpolation: string;

        labelDiv: IGraphDiv;
        labelPosition: string;
        positionLabel: (view:IView) => void;

        startArrow: boolean;
        endArrow: boolean;

        startPoint: ICoordinates;
        midPoint: ICoordinates;
        endPoint: ICoordinates;

        //LABEL_POSITION_MIDDLE: string;
        //LABEL_POSITION_START: string;

        START_ARROW_STRING: string;
        END_ARROW_STRING: string;
        BOTH_ARROW_STRING: string;
    }

    export class Curve extends ViewObject implements ICurve {

        public data;
        public startPoint;
        public midPoint;
        public endPoint;

        public interpolation;

        public label;
        public labelPosition;
        public labelDiv;

        public startArrow;
        public endArrow;

        public START_ARROW_STRING;
        public END_ARROW_STRING;
        public BOTH_ARROW_STRING;

        static LABEL_POSITION_MIDDLE ='MIDDLE';
        static LABEL_POSITION_START = 'START';

        static START_ARROW_STRING = 'START';
        static END_ARROW_STRING = 'END';
        static BOTH_ARROW_STRING = 'BOTH';


        constructor(definition:CurveDefinition, modelPath?: string) {

            if(definition.hasOwnProperty('params')) {

                var p = definition.params;

                if (p.hasOwnProperty('label')) {
                    definition.label = {
                        text: p.label
                    }
                }

                if (p.hasOwnProperty('labelPrefix')) {
                    definition.label.text = p.labelPrefix + definition.label.text;
                }

                if (p.hasOwnProperty('areaUnderLabel')) {
                    
                }

            }

            definition = _.defaults(definition, {data: [], interpolation: 'linear'});

            super(definition, modelPath);

            if(definition.label) {
                var labelDef = _.defaults(definition.label, {
                    name: definition.name + '_label',
                    objectName: definition.objectName,
                    className: definition.className,
                    xDrag: definition.xDrag,
                    yDrag: definition.yDrag,
                    color: definition.color,
                    show: definition.show,
                    backgroundColor: 'white'
                });
                //console.log(labelDef);
                this.labelDiv = new GraphDiv(labelDef);
            }

            this.startArrow = (definition.arrows == Curve.START_ARROW_STRING || definition.arrows == Curve.BOTH_ARROW_STRING);
            this.endArrow = (definition.arrows == Curve.END_ARROW_STRING || definition.arrows == Curve.BOTH_ARROW_STRING);

            this.viewObjectSVGtype = 'path';
            this.viewObjectClass = 'curve';
        }

        createSubObjects(view,scope) {
            var labelDiv = this.labelDiv;
            if(labelDiv) {
                return view.addObject(labelDiv.update(scope));
            } else {
                return view;
            }
        }

        positionLabel(view) {
            var curve = this,
                autoAlign = 'center',
                autoVAlign = 'middle';
            if(curve.labelDiv) {
                if(!curve.startPoint) {
                    curve.labelDiv.show = false;
                } else {
                    curve.labelDiv.show = curve.show;
                    var labelViewCoordinates = (curve.labelPosition == Curve.LABEL_POSITION_START) ? curve.startPoint : (curve.labelPosition == Curve.LABEL_POSITION_MIDDLE) ? curve.midPoint : curve.endPoint;
                    var labelCoordinates = view.modelCoordinates(_.clone(labelViewCoordinates));
                    if(labelCoordinates.y > view.yAxis.domain.max) {
                        labelCoordinates.y = view.yAxis.domain.max;
                        autoVAlign = 'bottom';
                    } else if(labelCoordinates.x >= view.xAxis.domain.max) {
                        labelCoordinates.x = view.xAxis.domain.max;
                        autoAlign = 'left';
                    } else {
                        autoAlign = (view.nearRight(labelCoordinates) || view.nearLeft(labelCoordinates)) || view.nearBottom(labelCoordinates) ? 'left' : 'center';
                        autoVAlign = (view.nearTop(labelCoordinates) || view.nearBottom(labelCoordinates)) ? 'bottom' : 'middle';
                    }
                    curve.labelDiv.coordinates = labelCoordinates;
                    if(!curve.labelDiv.definition.hasOwnProperty('align')) {
                        curve.labelDiv.align = autoAlign;
                    }
                    if(!curve.labelDiv.definition.hasOwnProperty('valign')) {
                        curve.labelDiv.valign = autoVAlign;
                    }
                }
            }
        }

        addArrows(group: D3.Selection) {

            var curve = this;

            var length = KG.distanceBetweenCoordinates(curve.startPoint, curve.endPoint);

            if(length) {
                if(curve.endArrow && length > 0) {
                    curve.addArrow(group,'end');
                } else {
                    curve.removeArrow(group,'end');
                }

                if(curve.startArrow && length > 0) {
                    curve.addArrow(group,'start');
                } else {
                    curve.removeArrow(group,'start');
                }
            }


        }

        render(view) {

            var curve = this;

            curve.updateDataForView(view);

            var dataCoordinates:ICoordinates[] = view.dataCoordinates(curve.data);

            var dataLength = dataCoordinates.length;

            curve.startPoint = dataCoordinates[0];
            curve.endPoint = dataCoordinates[dataLength - 1];
            curve.midPoint = medianDataPoint(dataCoordinates);

            var group:D3.Selection = view.objectGroup(curve.name, curve.initGroupFn(), false);

            curve.addArrows(group);
            curve.positionLabel(view);

            var dataLine = d3.svg.line()
                .interpolate(this.interpolation)
                .x(function (d) { return d.x })
                .y(function (d) { return d.y });

            var selector = curve.hasOwnProperty('objectName') ? 'path.' + curve.objectName : 'path.' + curve.viewObjectClass;

            var dataPath:D3.Selection = group.select(selector);

            dataPath
                .attr({
                    'class': curve.classAndVisibility(),
                    'd': dataLine(dataCoordinates)
                });

            return view;
        }

    }

}