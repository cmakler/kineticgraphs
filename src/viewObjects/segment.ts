/// <reference path="../kg.ts"/>

'use strict';

module KineticGraphs {

    export interface SegmentDefinition extends ViewObjectDefinition {
        a: ICoordinates;
        b: ICoordinates;
        label?: string;
    }

    export interface ISegment extends IViewObject {
        a: ICoordinates;
        b: ICoordinates;
        label: string;
        labelDiv: IGraphDiv;
    }

    export class Segment extends ViewObject implements ISegment {

        public a;
        public b;
        public label;
        public labelDiv;

        constructor(definition:SegmentDefinition) {

            super(definition);

            if(definition.label) {
                var labelDefinition = _.clone(definition);
                labelDefinition.coordinates = {
                    x: 0.5*(definition.a.x + definition.b.x),
                    y: 0.5*(definition.a.y + definition.b.y)
                };
                this.labelDiv = new GraphDiv(labelDefinition);
            }

            this.viewObjectSVGtype = 'path';
            this.viewObjectClass = 'segment';
        }

        render(view) {

            var segment = this;

            var group:D3.Selection = view.objectGroup(segment.name, segment.initGroupFn(), false);

            var dataLine = d3.svg.line()
                .x(function (d) { return view.xAxis.scale(d.x) })
                .y(function (d) { return view.yAxis.scale(d.y) });

            var segmentSelection:D3.Selection = group.select('.'+ segment.viewObjectClass);

            segmentSelection
                .attr({
                    'class': segment.classAndVisibility(),
                    'd': dataLine([segment.a, segment.b])
                });

            return view;
        }

    }

}