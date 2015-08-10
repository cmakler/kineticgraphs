/// <reference path="../kg.ts"/>

'use strict';

module KG {

    export interface LineDefinition extends ViewObjectDefinition {
        type: string;
        def: KGMath.Functions.LinearDefinition;
        arrows?: string;
    }

    export interface ILine extends IViewObject {

        linear: KGMath.Functions.Linear;
        arrows: string;
    }

    export class Line extends ViewObject implements ILine {

        public linear;
        public arrows;

        constructor(definition:LineDefinition) {

            definition.color = definition.color || 'gray';

            super(definition);

            this.linear = new KGMath.Functions[definition.type](definition.def);

            this.viewObjectSVGtype = 'path';
            this.viewObjectClass = 'line';
        }

        _update(scope) {
            this.linear.update(scope);
            return this;
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

            if(line.arrows == BOTH_ARROW_STRING) {
                line.addArrow(group,'start');
                line.addArrow(group,'end');
            } else if(line.arrows == OPEN_ARROW_STRING) {
                if(startPoint.x == view.xAxis.max || startPoint.y == view.yAxis.max) {
                    line.addArrow(group,'start');
                } else {
                    line.removeArrow(group,'start');
                }
                if(endPoint.x == view.xAxis.max || endPoint.y == view.yAxis.max) {
                    line.addArrow(group,'end');
                } else {
                    line.removeArrow(group,'end');
                }
            } else if(line.arrows == NO_ARROW_STRING) {
                line.removeArrow(group,'start');
                line.removeArrow(group,'end');
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

            return view;
        }



    }

}