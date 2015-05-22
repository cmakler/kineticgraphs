/// <reference path="../kg.ts"/>
/// <reference path="graphDiv.ts"/>

declare var katex: any;

module KineticGraphs
{

    export interface IControlDiv extends IGraphDiv {
        xDomain: IDomain;
        yDomain: IDomain;
    }

    export class ControlDiv extends GraphDiv implements IControlDiv
    {

        // control-point-specific attributes
        public xDomain;
        public yDomain;

        constructor() {
            super();
        }

        render(graph) {

            var xRaw = this.coordinates.x,
                yRaw = this.coordinates.y,
                width = this.dimensions.width,
                height = this.dimensions.height,
                text = this.text;

            var x,y,xDrag,yDrag;

            if(typeof xRaw == 'string' && graph.scope.params.hasOwnProperty(xRaw)) {
                x = graph.xAxis.scale(graph.scope.$eval('params.' + xRaw));
                xDrag = true;
            } else {
                x = graph.xAxis.scale(xRaw);
                xDrag = false;
            }

            if(typeof yRaw == 'string' && graph.scope.params.hasOwnProperty(yRaw)) {
                y = graph.yAxis.scale(graph.scope.params[yRaw]);
                yDrag = true;
            } else {
                y = graph.yAxis.scale(yRaw);
                yDrag = false;
            }

            var div:D3.Selection = graph.getDiv(this.name);

            div
                .style('cursor','move')
                .style('text-align','center')
                .style('color','gray')
                .style('position','absolute')
                .style('width',width + 'px')
                .style('height',height + 'px')
                .style('line-height',height + 'px')

            // Set left pixel margin
            var halfWidth = width * 0.5;
            // Default to centered on x coordinate
            var leftPixels = x - halfWidth;
            if (this.align == 'left') {
                // move right by half the width of the div if left aligned
                leftPixels += halfWidth
            } else if (this.align == 'right') {
                // move left by half the width of the div if right aligned
                leftPixels -= halfWidth;
            }
            div.style('left',leftPixels + 'px');

            // Set top pixel margin
            var halfHeight = height * 0.5;
            // Default to centered on x coordinate
            var topPixels = y - halfHeight;
            if (this.valign == 'top') {
                // move down by half the height of the div if top aligned
                topPixels += halfWidth
            } else if (this.align == 'right') {
                // move up by half the height of the div if right aligned
                topPixels -= halfWidth;
            }
            div.style('top',topPixels + 'px');

            // establish drag behavior
            var drag = d3.behavior.drag()
                .on("drag", function () {
                    console.log('dragging');
                    var dragUpdate = {}, newX, newY;
                    if(xDrag) {
                        newX = graph.xAxis.scale.invert(d3.event.x);
                        if(graph.xAxis.domain.contains(newX)) {
                            dragUpdate[xRaw] = graph.xAxis.scale.invert(d3.event.x)
                        }
                    }
                    if(yDrag) {
                        newY = graph.yAxis.scale.invert(d3.event.y);
                        if(graph.yAxis.domain.contains(newY)) {
                            dragUpdate[yRaw] = graph.yAxis.scale.invert(d3.event.y)
                        }
                    }
                    graph.updateParams(dragUpdate)
                });

            katex.render(text,div[0][0]);

            div.call(drag);

            return graph;

        }
    }



}