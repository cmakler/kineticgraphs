/// <reference path="../kg.ts"/>

'use strict';

module KG {

    export interface SegmentDefinition extends ViewObjectDefinition {
        a: any;
        b: any;
        label?: GraphDivDefinition;
        arrows?: string;
    }

    export interface ISegment extends IViewObject {
        a: ICoordinates;
        b: ICoordinates;
        midpoint: ICoordinates;
        labelDiv: IGraphDiv;
        startArrow: boolean;
        endArrow: boolean;
        length: number;

        START_ARROW_STRING: string;
        END_ARROW_STRING: string;
        BOTH_ARROW_STRING: string;
    }

    export class Segment extends ViewObject implements ISegment {

        public a;
        public b;
        public label;
        public labelDiv;
        public startArrow;
        public endArrow;
        public midpoint;
        public length;

        public START_ARROW_STRING;
        public END_ARROW_STRING;
        public BOTH_ARROW_STRING;

        static START_ARROW_STRING = 'START';
        static END_ARROW_STRING = 'END';
        static BOTH_ARROW_STRING = 'BOTH';


        constructor(definition:SegmentDefinition) {

            definition.a = KG.getCoordinates(definition.a);
            definition.b = KG.getCoordinates(definition.b);
            definition.color = definition.color || 'gray';

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

            this.startArrow = (definition.arrows == Segment.START_ARROW_STRING || definition.arrows == Segment.BOTH_ARROW_STRING);
            this.endArrow = (definition.arrows == Segment.END_ARROW_STRING || definition.arrows == Segment.BOTH_ARROW_STRING);

            this.viewObjectSVGtype = 'path';
            this.viewObjectClass = 'segment';
        }

        _update(scope) {

            var segment = this;

            segment.midpoint = {
                x: 0.5*(segment.a.x + segment.b.x),
                y: 0.5*(segment.a.y + segment.b.y)
            };

            if(segment.hasOwnProperty('labelDiv')){
                segment.labelDiv.coordinates = segment.midpoint;
            }

            segment.length = KG.distanceBetweenCoordinates(segment.a,segment.b);

            return segment;
        }

        createSubObjects(view) {
            var labelDiv = this.labelDiv;
            if(labelDiv) {
                return view.addObject(labelDiv);
            } else {
                return view;
            }
        }

        render(view) {

            var segment = this;

            var group:D3.Selection = view.objectGroup(segment.name, segment.initGroupFn(), false);

            if(segment.endArrow && segment.length > 0) {
                group.attr("marker-end", "url(#arrow-end-" + segment.color + ")")
            } else {
                group.attr("marker-end",null)
            }

            if(segment.startArrow && segment.length > 0) {
                group.attr("marker-start", "url(#arrow-start-" + segment.color + ")");
            } else {
                group.attr("market-start",null)
            }



            var dataLine = d3.svg.line()
                .x(function (d) { return view.xAxis.scale(d.x) })
                .y(function (d) { return view.yAxis.scale(d.y) });

            var segmentSelection:D3.Selection = group.select('.'+ segment.viewObjectClass);

            segmentSelection
                .attr({
                    'class': segment.classAndVisibility(),
                    'd': dataLine([segment.a, segment.b]),
                    'stroke': segment.color,
                })

            return view;
        }

    }

}