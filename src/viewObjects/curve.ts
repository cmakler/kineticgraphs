/// <reference path="../kg.ts"/>

'use strict';

module KG {

    export interface CurveDefinition extends ViewObjectDefinition {
        data?: ICoordinates[];
        interpolation?: string;
        label?: GraphDivDefinition;
        arrows?: string;
    }

    export interface ICurve extends IViewObject {

        data: ICoordinates[];
        interpolation: string;

        labelDiv: IGraphDiv;
        positionLabel: (view:IView) => void;

        startArrow: boolean;
        endArrow: boolean;

        startPoint: ICoordinates;
        midPoint: ICoordinates;
        endPoint: ICoordinates;

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
        public labelDiv;
        public startArrow;
        public endArrow;

        public START_ARROW_STRING;
        public END_ARROW_STRING;
        public BOTH_ARROW_STRING;

        static START_ARROW_STRING = 'START';
        static END_ARROW_STRING = 'END';
        static BOTH_ARROW_STRING = 'BOTH';


        constructor(definition:CurveDefinition) {

            definition = _.defaults(definition, {data: [], interpolation: 'linear'});

            super(definition);

            if(definition.label) {
                var labelDef = _.defaults(definition.label, {
                    name: definition.name + '_label',
                    xDrag: definition.xDrag,
                    yDrag: definition.yDrag,
                    color: definition.color
                });
                this.labelDiv = new GraphDiv(labelDef);
            }

            this.startArrow = (definition.arrows == Curve.START_ARROW_STRING || definition.arrows == Curve.BOTH_ARROW_STRING);
            this.endArrow = (definition.arrows == Curve.END_ARROW_STRING || definition.arrows == Curve.BOTH_ARROW_STRING);

            this.viewObjectSVGtype = 'path';
            this.viewObjectClass = 'curve';
        }

        createSubObjects(view) {
            var labelDiv = this.labelDiv;
            if(labelDiv) {
                return view.addObject(labelDiv);
            } else {
                return view;
            }
        }

        _update(scope) {

            var curve = this;

            var dataLength = curve.data.length;

            curve.startPoint = curve.data[0];
            curve.endPoint = curve.data[dataLength - 1];
            curve.midPoint = medianDataPoint(curve.data);

            return curve;
        }

        positionLabel(view:IView) {

            var curve = this;
            curve.labelDiv.coordinates = curve.midPoint;

        }

        addArrows(group: D3.Selection) {

            var curve = this;

            var length = KG.distanceBetweenCoordinates(curve.startPoint, curve.endPoint);

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

        render(view) {

            var curve = this;

            var dataCoordinates:ICoordinates[] = view.dataCoordinates(curve.data);

            var group:D3.Selection = view.objectGroup(curve.name, curve.initGroupFn(), false);

            curve.addArrows(group);
            curve.positionLabel(view);

            var dataLine = d3.svg.line()
                .interpolate(this.interpolation)
                .x(function (d) { return d.x })
                .y(function (d) { return d.y });

            var dataPath:D3.Selection = group.select('.' + curve.viewObjectClass);

            dataPath
                .attr({
                    'class': curve.classAndVisibility(),
                    'd': dataLine(dataCoordinates)
                });

            return view;
        }

    }

}