/// <reference path="../kg.ts"/>
/// <reference path="graphObjects.ts"/>

module KineticGraphs
{

    export interface IPoint extends IGraphObject {

        // point-specific attributes
        coordinates: ICoordinates;
        symbol?: string;
        size?: number;
    }

    export class Point extends GraphObject implements IPoint
    {

        // generic attributes
        public show;
        public name;
        public className;

        // point-specific attributes
        public coordinates;
        public symbol;
        public size;

        constructor() {

            super();

            // establish defaults
            this.coordinates = {x: 0, y: 0};
            this.size = 100;
            this.symbol = 'circle';
        }

        render(graph) {

            // constants TODO should these be defined somewhere else?
            var POINT_SYMBOL_CLASS = 'pointSymbol';

            var xRaw = this.coordinates.x,
                yRaw = this.coordinates.y

            var x,y,xDrag,yDrag;

            if(typeof xRaw == 'string') {
                x = graph.xAxis.scale(graph.scope.$eval('params.' + xRaw));
                xDrag = true;
            } else {
                x = graph.xAxis.scale(xRaw);
                xDrag = false;
            }

            if(typeof yRaw == 'string' && graph.scope.params.hasOwnProperty(yRaw)) {
                y = graph.yAxis.scale(graph.scope.params[yRaw])
                yDrag = true;
            } else {
                y = graph.yAxis.scale(yRaw);
                yDrag = false;
            }

            // initialization of D3 graph object group
            function init(newGroup:D3.Selection) {
                newGroup.append('path').attr('class', POINT_SYMBOL_CLASS);
                return newGroup;
            }

            var group:D3.Selection = graph.objectGroup(this.name, init);

            // establish drag behavior
            var drag = d3.behavior.drag()
                .on("drag", function () {
                    var dragUpdate = {};
                    if(xDrag) {
                        dragUpdate[xRaw] = graph.xAxis.scale.invert(d3.event.x)
                    }
                    if(yDrag) {
                        dragUpdate[yRaw] = graph.yAxis.scale.invert(d3.event.y)
                    }
                    graph.updateParams(dragUpdate)
                });

            // draw the symbol at the point
            var pointSymbol:D3.Selection = group.select('.'+ POINT_SYMBOL_CLASS);
            if(this.symbol === 'none') {
                pointSymbol.attr('class','invisible ' + POINT_SYMBOL_CLASS);
            } else {
                pointSymbol
                    .attr({
                        'class': this.classAndVisibility() + ' ' + POINT_SYMBOL_CLASS,
                        'd': d3.svg.symbol().type(this.symbol).size(this.size),
                        'transform': "translate(" + x + "," + y + ")"
                        })
                    .call(drag);
            }

            return graph;

        }
    }



}