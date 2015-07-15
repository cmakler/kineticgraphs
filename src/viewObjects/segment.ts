/// <reference path="../kg.ts"/>

'use strict';

module KG {

    export interface SegmentDefinition extends ViewObjectDefinition {
        a: any;
        b: any;
        label?: GraphDivDefinition;
    }

    export interface ISegment extends IViewObject {
        a: ICoordinates;
        b: ICoordinates;
        labelDiv: IGraphDiv;
    }

    export class Segment extends ViewObject implements ISegment {

        public a;
        public b;
        public label;
        public labelDiv;

        constructor(definition:SegmentDefinition) {

            definition.a = KG.getCoordinates(definition.a);
            definition.b = KG.getCoordinates(definition.b);

            super(definition);

            if(definition.label) {
                var labelDef = _.defaults(definition.label, {
                    name: definition.name + '_label',
                    xDrag: definition.xDrag,
                    yDrag: definition.yDrag
                });
                this.labelDiv = new GraphDiv(labelDef);
            }

            this.viewObjectSVGtype = 'path';
            this.viewObjectClass = 'segment';
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

            var dataLine = d3.svg.line()
                .x(function (d) { return view.xAxis.scale(d.x) })
                .y(function (d) { return view.yAxis.scale(d.y) });

            var segmentSelection:D3.Selection = group.select('.'+ segment.viewObjectClass);

            segmentSelection
                .attr({
                    'class': segment.classAndVisibility(),
                    'd': dataLine([segment.a, segment.b])
                });

            segment.labelDiv.coordinates = {
                x: 0.5*(segment.a.x + segment.b.x),
                y: 0.5*(segment.a.y + segment.b.y)
            };

            //segment.labelDiv.render(view);

            return view;
        }

    }

}