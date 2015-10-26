/// <reference path="../kg.ts"/>

'use strict';

module KG {

    export interface LineParamsDefinition extends ViewObjectParamsDefinition {
        label?: string;
        yInterceptLabel?: string;
        xInterceptLabel?: string;
        areaUnderLabel?: string;
        areaOverLabel?: string;
    }

    export interface LineDefinition extends ViewObjectDefinition {
        lineDef?: KGMath.Functions.LinearDefinition;
        linear?: any;
        arrows?: string;
        label?: GraphDivDefinition;
        xInterceptLabel?: string;
        yInterceptLabel?: string;
        x?: any;
        y?: any;
        params?: LineParamsDefinition;
        areaUnderDef?: AreaDefinition;
        areaOverDef?: AreaDefinition;
    }

    export interface ILine extends IViewObject {

        linear: KGMath.Functions.Linear;
        labelDiv: GraphDiv;
        xInterceptLabelDiv: GraphDiv;
        yInterceptLabelDiv: GraphDiv;
        arrows: string;
        areaUnder: Area;
        areaOver: Area;
    }

    export class Line extends ViewObject implements ILine {

        public linear;
        public arrows;

        public labelDiv;
        public areaUnder;
        public areaOver;
        public xInterceptLabelDiv;
        public yInterceptLabelDiv;

        constructor(definition:LineDefinition, modelPath?: string) {

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
                    color: definition.color,
                    show: definition.show
                });
                //console.log(labelDef);
                line.labelDiv = new GraphDiv(labelDef);
            }

            if(definition.areaUnderDef) {
                line.areaUnder = new Area(definition.areaUnderDef);
            }

            if(definition.areaOverDef) {
                line.areaOver = new Area(definition.areaOverDef);
            }

            if(definition.hasOwnProperty('xInterceptLabel')) {
                var xInterceptLabelDef:GraphDivDefinition = {
                    name: definition.name + 'x_intercept_label',
                    className: definition.className,
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
                    className: definition.className,
                    text: definition.yInterceptLabel,
                    dimensions: {width: 50, height:20},
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

        createSubObjects(view,scope) {

            var line = this;

            if(line.xInterceptLabelDiv) {
                view.addObject(line.xInterceptLabelDiv.update(scope))
            }

            if(line.yInterceptLabelDiv) {
                view.addObject(line.yInterceptLabelDiv.update(scope))
            }

            if(line.labelDiv) {
                view.addObject(line.labelDiv.update(scope))
            }

            if(line.areaUnder) {
                view.addObject(line.areaUnder.update(scope));
                view.addObject(line.areaUnder.labelDiv.update(scope));
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

            if(startPoint == undefined || endPoint == undefined) {
                console.log('point is undefined')
            } else {
                var yIntercept = isAlmostTo(startPoint.x,view.xAxis.min) ? startPoint : isAlmostTo(endPoint.x,view.xAxis.min) ? endPoint : null;
                var xIntercept = isAlmostTo(startPoint.y,view.yAxis.min) ? startPoint : isAlmostTo(endPoint.y,view.yAxis.min) ? endPoint : null;
                var yRightEdge = isAlmostTo(startPoint.x,view.xAxis.max) ? startPoint : isAlmostTo(endPoint.x,view.xAxis.max) ? endPoint : null;
                var xTopEdge = isAlmostTo(startPoint.y,view.yAxis.max) ? startPoint : isAlmostTo(endPoint.y,view.yAxis.max) ? endPoint : null;
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

                    var labelPoint, labelAlign = 'left', labelValign = 'bottom';

                    if(line instanceof VerticalLine) {
                        labelPoint = xTopEdge;
                        labelAlign = 'center';
                    } else if (line instanceof HorizontalLine) {
                        labelPoint = yRightEdge;
                        labelValign = 'middle';
                    } else if (linear.slope > 0) {
                        labelPoint = (startPoint.y > endPoint.y) ? startPoint : endPoint;
                    } else {
                        labelPoint = (startPoint.x > endPoint.x) ? startPoint : endPoint;
                    }

                    var yMin = view.yAxis.min + (view.yAxis.max - view.yAxis.min)*0.02;
                    line.labelDiv.coordinates = {x: labelPoint.x, y: Math.max(yMin, labelPoint.y)};
                    line.labelDiv.align = labelAlign;
                    line.labelDiv.valign = labelValign;

                    /* OLD LOGIC
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
                    } */
                }

                if(line.areaUnder) {
                    var areaData = [view.corners.bottom.left];
                    if(xIntercept) {
                        if(yIntercept) {
                            // line connects x-axis and y-intercept; color triangle below and to the left
                            areaData.push(xIntercept);
                            areaData.push(yIntercept);
                        } else if(xTopEdge) {
                            // line connects x-axis and top of graph; color quadrilateral formed by line and y-axis
                            areaData.push(xIntercept);
                            areaData.push(xTopEdge);
                            areaData.push(view.corners.top.left);
                        } else if(yRightEdge) {
                            // line connects x-axis and right of graph; color everything but the triangle in the lower-right
                            areaData.push(xIntercept);
                            areaData.push(yRightEdge);
                            areaData.push(view.corners.top.right);
                            areaData.push(view.corners.top.left);
                        }
                    } else if(yIntercept) {
                        if(xTopEdge && areNotTheSamePoint(xTopEdge,yIntercept)) {
                            // line connects y-axis and top of graph; color everything but the triangle in upper-left
                            areaData.push(yIntercept);
                            areaData.push(xTopEdge);
                            areaData.push(view.corners.top.right);
                            areaData.push(view.corners.bottom.right);
                        } else if(yRightEdge) {
                            // line connects y-axis and right of graph; color quadrilateral beneath the line
                            areaData.push(yIntercept);
                            areaData.push(yRightEdge);
                            areaData.push(view.corners.bottom.right);
                        }
                    } else {
                        // line connects top and right of graph; color everything except triangle in upper right
                        areaData.push(view.corners.top.left);
                        areaData.push(xTopEdge);
                        areaData.push(yRightEdge);
                        areaData.push(view.corners.bottom.right);
                    }
                    line.areaUnder.data = areaData;
                }

                if(line.areaOver) {
                    var areaData = [view.corners.top.right];
                    if(xIntercept) {
                        if(yIntercept) {
                            // line connects x-axis and y-intercept; color everything but the triangle below and to the left
                            areaData.push(view.corners.bottom.right);
                            areaData.push(xIntercept);
                            areaData.push(yIntercept);
                            areaData.push(view.corners.top.left);
                        } else if(xTopEdge) {
                            // line connects x-axis and top of graph; color quadrilateral formed by line and right edge
                            areaData.push(xTopEdge);
                            areaData.push(xIntercept);
                            areaData.push(view.corners.bottom.right);
                        } else if(yRightEdge) {
                            // line connects x-axis and right of graph; color everything but the triangle in the lower-right
                            areaData.push(yRightEdge);
                            areaData.push(xIntercept);
                            areaData.push(view.corners.bottom.left);
                            areaData.push(view.corners.top.left);
                        }
                    } else if(yIntercept) {
                        if(xTopEdge) {
                            // line connects y-axis and top of graph; color everything but the triangle in upper-left
                            areaData.push(xTopEdge);
                            areaData.push(yIntercept);
                            areaData.push(view.corners.bottom.left);
                            areaData.push(view.corners.bottom.right);
                        } else if(yRightEdge) {
                            // line connects y-axis and right of graph; color quadrilateral above the line
                            areaData.push(yRightEdge);
                            areaData.push(yIntercept);
                            areaData.push(view.corners.top.left);
                        }
                    } else {
                        // line connects top and right of graph; color triangle in upper right
                        areaData.push(xTopEdge);
                        areaData.push(yRightEdge);
                    }
                    line.areaOver.data = areaData;
                }

                if(line.xInterceptLabelDiv) {
                    line.xInterceptLabelDiv.coordinates = {x: line.linear.xValue(view.yAxis.min), y: 'AXIS'};
                    if(line.xInterceptLabelDiv.definition.text == 'foo') {
                        line.xInterceptLabelDiv.text = line.linear.xValue(view.yAxis.min);
                    }
                }

                if(line.yInterceptLabelDiv) {
                    line.yInterceptLabelDiv.coordinates = {x: 'AXIS', y: line.linear.yValue(view.xAxis.min)};
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