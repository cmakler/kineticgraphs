/// <reference path="../kg.ts"/>

'use strict';

declare var katex;

module KG
{

    export interface GraphDivDefinition extends ViewObjectDefinition {
        dimensions?: IDimensions;
        textArray?: any[];
        text?: any;
        math?: boolean;
        align?: any;
        valign?: any;
        backgroundColor?: string;
    }

    export interface IGraphDiv extends IViewObject {

        // GraphDiv-specific attributes
        coordinates: ICoordinates; // pixel coordinates, not model coordinates
        dimensions: IDimensions;
        text: string;
        math: boolean;
        align: string;
        valign: string;
        color: string;
        backgroundColor?: string;
        AXIS_COORDINATE_INDICATOR: string;
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
        public color;
        public backgroundColor;
        public AXIS_COORDINATE_INDICATOR;

        static AXIS_COORDINATE_INDICATOR = 'AXIS';

        constructor(definition:GraphDivDefinition, modelPath?: string) {

            definition = _.defaults(definition,{
                dimensions: {width: 50, height: 20},
                text: '',
                color: KG.colorForClassName(definition.className)
            });

            super(definition, modelPath);

        }

        render(view) {

            var divObj = this;

            if(divObj.text instanceof Array) {
                divObj.text = divObj.text.join('')
            }

            if(!divObj.hasOwnProperty('coordinates') || divObj.text.length == 0) {
                return view;
            }

            var x, y;

            if(divObj.coordinates.x == GraphDiv.AXIS_COORDINATE_INDICATOR) {
                x = view.margins.left - view.yAxis.textMargin;
                divObj.align = 'right';
                divObj.valign = 'middle';
                if(!view.yAxis.domain.contains(divObj.coordinates.y)) {
                    divObj.className = 'invisible';
                }
            } else {
                x = view.margins.left + view.xAxis.scale(divObj.coordinates.x);
            }

            if(divObj.coordinates.y == GraphDiv.AXIS_COORDINATE_INDICATOR) {
                y = view.dimensions.height - view.margins.bottom + view.xAxis.textMargin;
                divObj.align = 'center';
                divObj.valign = 'top';
                if(!view.xAxis.domain.contains(divObj.coordinates.x)) {
                    divObj.className = 'invisible';
                }
            } else {
                y = view.margins.top + view.yAxis.scale(divObj.coordinates.y);
            }

            var width = divObj.dimensions.width,
                height = divObj.dimensions.height,
                text = divObj.text,
                draggable = (divObj.xDrag || divObj.yDrag);

            var div:D3.Selection = view.getDiv(this.objectName || this.name);

            div
                .style('cursor','default')
                .style('text-align','center')
                .style('position','absolute')
                .style('width',width + 'px')
                .style('height',height + 'px')
                .style('line-height',height + 'px')
                .style('background-color',divObj.backgroundColor)
                .attr('class',divObj.classAndVisibility());

            // Set left pixel margin; default to centered on x coordinate
            var alignDelta = width*0.5;
            if (divObj.align == 'left') {
                alignDelta = 0;
                div.style('text-align','left');
            } else if (this.align == 'right') {
                // move left by half the width of the div if right aligned
                alignDelta = width + 2;
                div.style('text-align','right');
            }
            div.style('left',(x - alignDelta) + 'px');


            // Set top pixel margin; default to centered on y coordinate
            var vAlignDelta = height*0.5;
            // Default to centered on x coordinate
            if (this.valign == 'top') {
                vAlignDelta = 0;
            } else if (this.valign == 'bottom') {
                vAlignDelta = height;
            }
            div.style('top',(y - vAlignDelta) + 'px');

            katex.render(text.toString(),div[0][0]);

            if(draggable){
                return divObj.setDragBehavior(view,div);
            } else {
                return view;
            }

        }
    }



}