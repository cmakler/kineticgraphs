/// <reference path="../kg.ts"/>

'use strict';

declare var katex;

module KineticGraphs
{

    export interface GraphDivDefinition extends ViewObjectDefinition {

        coordinates: ICoordinates; // pixel coordinates, not model coordinates
        dimensions?: IDimensions;
        text?: string;
        math?: boolean;
        align?: string;
        valign?: string;

    }

    export interface IGraphDiv extends IViewObject {

        // GraphDiv-specific attributes
        coordinates: ICoordinates; // pixel coordinates, not model coordinates
        dimensions: IDimensions;
        text: string;
        math: boolean;
        align: string;
        valign: string;
        xDragParam: string;
        yDragParam: string;
    }

    export class GraphDiv extends ViewObject implements IGraphDiv
    {

        // GraphDiv-specific attributes
        public coordinates;
        public dimensions;
        public text;
        public math;
        public align;
        public valign;
        public xDragParam;
        public yDragParam;

        constructor(definition:GraphDivDefinition) {

            definition = _.defaults(definition,{
                coordinates: {x: 0, y: 0},
                dimensions: {width: 100, height: 20},
                math: false,
                align: 'center',
                text: ''
            });

            super(definition);

        }

        render(view) {

            var cd = this;

            var x = view.margins.left + view.xAxis.scale(cd.coordinates.x),
                y = view.margins.top + view.yAxis.scale(cd.coordinates.y),
                width = cd.dimensions.width,
                height = cd.dimensions.height,
                text = cd.text,
                draggable = (cd.hasOwnProperty('xDragParam') || cd.hasOwnProperty('yDragParam'))

            var div:D3.Selection = view.getDiv(this.name);

            div
                .style('text-align','center')
                .style('color','gray')
                .style('position','absolute')
                .style('width',width + 'px')
                .style('height',height + 'px')
                .style('line-height',height + 'px')

            // Set left pixel margin; default to centered on x coordinate
            var alignDelta = width*0.5;
            if (cd.align == 'left') {
                alignDelta = 0;
            } else if (this.align == 'right') {
                // move left by half the width of the div if right aligned
                alignDelta = width;
            }
            div.style('left',(x - alignDelta) + 'px');

            // Set top pixel margin; default to centered on y coordinate
            var vAlignDelta = height*0.5;
            // Default to centered on x coordinate
            if (this.valign == 'top') {
                vAlignDelta = 0;
            } else if (this.align == 'bottom') {
                vAlignDelta = height;
            }
            div.style('top',(y - vAlignDelta) + 'px');

            katex.render(text,div[0][0]);

            if(draggable){
                if(!cd.hasOwnProperty('xDragParam')) {
                    // allow vertical dragging only
                    div.style('cursor','ns-resize');
                    div.call(view.drag(null, cd.yDragParam, 0, view.dimensions.height - vAlignDelta));
                } else if(!cd.hasOwnProperty('yDragParam')){
                    // allow horizontal dragging only
                    div.style('cursor','ew-resize');
                    div.call(view.drag(cd.xDragParam, null, -view.margins.left, 0));
                } else {
                    // allow bidirectional dragging
                    div.style('cursor','move');
                    div.call(view.drag(cd.xDragParam, cd.yDragParam, -view.margins.left, view.dimensions.height - vAlignDelta));
                }


            }



            return view;

        }
    }



}