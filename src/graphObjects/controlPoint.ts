/// <reference path="../kg.ts"/>
/// <reference path="graphObjects.ts"/>

module KineticGraphs
{

    export interface IControlPoint extends IPoint {
        xDomain: IDomain;
        yDomain: IDomain;
    }

    export class ControlPoint extends Point implements IControlPoint
    {

        // control-point-specific attributes
        public xDomain;
        public yDomain;

        constructor() {
            super();
        }

        render(graph) {

            // constants TODO should these be defined somewhere else?
            var CONTROL_POINT_SYMBOL_CLASS = 'controlPointSymbol';

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
                newGroup.append('path').attr('class', CONTROL_POINT_SYMBOL_CLASS);
                return newGroup;
            }

            var group:D3.Selection = graph.objectGroup(this.name, init);

            // establish drag behavior
            var drag = d3.behavior.drag()
                .on("drag", function () {
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

            // draw the symbol at the point
            var pointSymbol:D3.Selection = group.select('.'+ CONTROL_POINT_SYMBOL_CLASS);
            if(this.symbol === 'none') {
                pointSymbol.attr('class','invisible ' + CONTROL_POINT_SYMBOL_CLASS);
            } else {
                pointSymbol
                    .attr({
                        'class': this.classAndVisibility() + ' ' + CONTROL_POINT_SYMBOL_CLASS,
                        'd': d3.svg.symbol().type(this.symbol).size(this.size),
                        'transform': "translate(" + x + "," + y + ")"
                    })
                    .call(drag);
            }

            return graph;

        }
    }



}