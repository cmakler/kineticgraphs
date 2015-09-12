/// <reference path="../kg.ts"/>

'use strict';

module KG {

    export interface LineDefinition extends ViewObjectDefinition {
        lineDef?: KGMath.Functions.LinearDefinition;
        linear?: any;
        arrows?: string;
        label?: GraphDivDefinition;
        xInterceptLabel?: string;
        yInterceptLabel?: string;
        x?: any;
        y?: any;
    }

    export interface ILine extends IViewObject {

        linear: KGMath.Functions.Linear;
        labelDiv: GraphDiv;
        xInterceptLabelDiv: GraphDiv;
        yInterceptLabelDiv: GraphDiv;
        arrows: string;
    }

    export class Line extends ViewObject implements ILine {

        public linear;
        public arrows;

        public labelDiv;
        public xInterceptLabelDiv;
        public yInterceptLabelDiv;

        constructor(definition:LineDefinition, modelPath?: string) {

            super(definition, modelPath);

            var line = this;

            if(line instanceof HorizontalLine) {
                line.linear = new KGMath.Functions.HorizontalLine({y: definition.y});
            } else if(line instanceof VerticalLine) {
                line.linear = new KGMath.Functions.VerticalLine({x: definition.x});
            } else if(definition.hasOwnProperty('lineDef')) {
                line.linear = new KGMath.Functions.Linear(definition.lineDef);}

            line.viewObjectSVGtype = 'path';
            line.viewObjectClass = 'line';

            if(definition.label) {
                var labelDef:GraphDivDefinition = _.defaults(definition.label, {
                    name: definition.name + '_label',
                    className: definition.className,
                    xDrag: definition.xDrag,
                    yDrag: definition.yDrag,
                    color: definition.color
                });
                //console.log(labelDef);
                line.labelDiv = new GraphDiv(labelDef);
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
                line.xInterceptLabelDiv = new KG.GraphDiv(xInterceptLabelDef);
            }

            if(definition.hasOwnProperty('yInterceptLabel')) {
                var yInterceptLabelDef:GraphDivDefinition = {
                    name: definition.name + 'y_intercept_label',
                    color: definition.color,
                    text: definition.xInterceptLabel,
                    dimensions: {width: 30, height:20},
                    yDrag: definition.yDrag,
                    backgroundColor: 'white'
                };
                line.yInterceptLabelDiv = new KG.GraphDiv(yInterceptLabelDef);
            }

        }

        _update(scope) {
            this.linear.update(scope);
            return this;
        }

        createSubObjects(view) {

            var line = this;

            if(line.xInterceptLabelDiv) {
                view.addObject(line.xInterceptLabelDiv)
            }

            if(line.yInterceptLabelDiv) {
                view.addObject(line.yInterceptLabelDiv)
            }

            if(line.labelDiv) {
                view.addObject(line.labelDiv)
            }

            return view;
        }

        render(view) {

        var NO_ARROW_STRING = 'NONE',
            BOTH_ARROW_STRING = 'BOTH',
            OPEN_ARROW_STRING = 'OPEN';

            var line = this,
                linear = this.linear,
                draggable = (line.xDrag || line.yDrag);

            var group:D3.Selection = view.objectGroup(line.name, line.initGroupFn(), false);

            var startPoint = linear.points(view)[0],
                endPoint = linear.points(view)[1];

            var yIntercept = (startPoint.x == view.xAxis.min) ? startPoint : (endPoint.x == view.xAxis.min) ? endPoint : null;
            var xIntercept = (startPoint.y == view.yAxis.min) ? startPoint : (endPoint.y == view.yAxis.min) ? endPoint : null;
            var startIsOpen = (startPoint !== yIntercept && startPoint !== xIntercept);
            var endIsOpen = (endPoint !== yIntercept && endPoint !== xIntercept);

            if(line.arrows == BOTH_ARROW_STRING) {
                line.addArrow(group,'start');
                line.addArrow(group,'end');
            } else if(line.arrows == OPEN_ARROW_STRING) {
                if(startIsOpen) {
                    line.addArrow(group,'start');
                } else {
                    line.removeArrow(group,'start');
                }
                if(endIsOpen) {
                    line.addArrow(group,'end');
                } else {
                    line.removeArrow(group,'end');
                }
            } else if(line.arrows == NO_ARROW_STRING) {
                line.removeArrow(group,'start');
                line.removeArrow(group,'end');
            }

            if(line.labelDiv) {
                // If one end of the line is open, label that point
                if(endIsOpen || startIsOpen) {
                    line.labelDiv.coordinates = endIsOpen ? _.clone(endPoint) : _.clone(startPoint);
                    if(line.labelDiv.coordinates.x == view.xAxis.max) {
                        line.labelDiv.align = 'left';
                        line.labelDiv.valign = 'middle';
                    } else {
                        line.labelDiv.align = 'center';
                        line.labelDiv.valign = 'bottom';
                    }
                } else {
                    var yLevel = view.yAxis.min + (view.yAxis.max - view.yAxis.min)*0.05;
                    line.labelDiv.coordinates = {
                        x: linear.xValue(yLevel),
                        y: yLevel
                    };
                    line.labelDiv.valign = 'bottom';
                    line.labelDiv.align = (linear.slope > 0) ? 'right' : 'left';
                }
            }

            if(line.xInterceptLabelDiv && xIntercept) {
                line.xInterceptLabelDiv.coordinates = {x: xIntercept.x, y: 'AXIS'};
            }

            if(line.yInterceptLabelDiv && yIntercept) {
                line.yInterceptLabelDiv.coordinates = {x: 'AXIS', y: yIntercept.y};
            }

            var dataLine = d3.svg.line()
                .x(function (d) { return view.xAxis.scale(d.x) })
                .y(function (d) { return view.yAxis.scale(d.y) });

            var lineSelection:D3.Selection = group.select('.'+ line.viewObjectClass);

            lineSelection
                .attr({
                    'class': line.classAndVisibility(),
                    'd': dataLine([startPoint,endPoint]),
                    'stroke': line.color,
                });

            if(draggable){
                return line.setDragBehavior(view,lineSelection);
            } else {
                return view;
            }

        }

    }

    export class VerticalLine extends Line {

        constructor(definition, modelPath?: string) {
            super(definition, modelPath);
        }
    }

    export class HorizontalLine extends Line {

        constructor(definition, modelPath?: string) {
            super(definition, modelPath);
        }
    }

}