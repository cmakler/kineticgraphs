/// <reference path="../kg.ts"/>

declare var katex: any;

module KineticGraphs
{
    export interface ControlDivDefinition extends GraphDivDefinition {
        xParam?: string;
        yParam?: string;
    }

    export interface IControlDiv extends IGraphDiv {

    }

    export class ControlDiv extends GraphDiv implements IControlDiv
    {

        public xParam;
        public yParam;

        constructor(definition:ControlDivDefinition) {
            super(definition);
        }

        render(view) {

            var cd = this;

            var x = view.margins.left + view.xAxis.scale(cd.coordinates.x),
                y = view.margins.top + view.yAxis.scale(cd.coordinates.y),
                width = cd.dimensions.width,
                height = cd.dimensions.height,
                text = cd.text;

            var xDrag = cd.hasOwnProperty('xParam'),
                yDrag = cd.hasOwnProperty('yParam');

            var div:D3.Selection = view.getDiv(this.name);

            div
                .style('cursor','move')
                .style('text-align','center')
                .style('color','gray')
                .style('position','absolute')
                .style('width',width + 'px')
                .style('height',height + 'px')
                .style('line-height',height + 'px')

            // Set left pixel margin; default to centered on x coordinate
            var xAlignDelta = width*0.5;
            if (cd.align == 'left') {
                xAlignDelta = 0;
            } else if (this.align == 'right') {
                // move left by half the width of the div if right aligned
                xAlignDelta = width;
            }
            div.style('left',(x - xAlignDelta) + 'px');

            // Set top pixel margin; default to centered on y coordinate
            var vAlignDelta = height*0.5;
            // Default to centered on x coordinate
            if (this.valign == 'top') {
                vAlignDelta = 0;
            } else if (this.align == 'bottom') {
                vAlignDelta = height;
            }
            div.style('top',(y - vAlignDelta) + 'px');

            // establish drag behavior
            var drag = d3.behavior.drag()
                .on("drag", function () {
                    d3.event.sourceEvent.preventDefault();
                    console.log('dragging');
                    var dragUpdate = {}, newX, newY;
                    if(xDrag) {
                        newX = view.xAxis.scale.invert(d3.event.x - view.margins.left);
                        if(view.xAxis.domain.contains(newX)) {
                            dragUpdate[cd.xParam] = newX;
                        }
                    }
                    if(yDrag) {
                        newY = view.yAxis.scale.invert(view.dimensions.height - vAlignDelta + d3.event.y);
                        if(view.yAxis.domain.contains(newY)) {
                            dragUpdate[cd.yParam] = newY;
                        }
                    }
                    view.updateParams(dragUpdate)
                });

            katex.render(text,div[0][0]);

            div.call(drag);

            return view;

        }
    }



}