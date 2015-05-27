/// <reference path="../kg.ts"/>

'use strict';

declare var katex;

module KG
{

    export interface GraphDivDefinition extends ViewObjectDefinition {
        dimensions?: IDimensions;
        label?: string;
        math?: boolean;
        align?: string;
        valign?: string;
    }

    export interface IGraphDiv extends IViewObject {

        // GraphDiv-specific attributes
        coordinates: ICoordinates; // pixel coordinates, not model coordinates
        dimensions: IDimensions;
        label: string;
        math: boolean;
        align: string;
        valign: string;
    }

    export class GraphDiv extends ViewObject implements IGraphDiv
    {

        // GraphDiv-specific attributes
        public coordinates;
        public dimensions;
        public label;
        public math;
        public align;
        public valign;

        constructor(definition:GraphDivDefinition) {

            definition = _.defaults(definition,{
                coordinates: {x: 0, y: 0},
                dimensions: {width: 100, height: 20},
                math: false,
                align: 'center',
                label: ''
            });

            super(definition);

        }

        render(view) {

            var divObj = this;

            var x = view.margins.left + view.xAxis.scale(divObj.coordinates.x),
                y = view.margins.top + view.yAxis.scale(divObj.coordinates.y),
                width = divObj.dimensions.width,
                height = divObj.dimensions.height,
                label = divObj.label,
                draggable = (divObj.xDrag || divObj.yDrag);

            var div:D3.Selection = view.getDiv(this.name);

            div
                .style('cursor','default')
                .style('text-align','center')
                .style('color','gray')
                .style('position','absolute')
                .style('width',width + 'px')
                .style('height',height + 'px')
                .style('line-height',height + 'px')

            // Set left pixel margin; default to centered on x coordinate
            var alignDelta = width*0.5;
            if (divObj.align == 'left') {
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

            katex.render(label.toString(),div[0][0]);

            if(draggable){
                divObj.xDragDelta = -view.margins.left;
                divObj.yDragDelta = view.dimensions.height - vAlignDelta;
                return divObj.setDragBehavior(view,div);
            } else {
                return view;
            }

        }
    }



}