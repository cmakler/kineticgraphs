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

            // initialization of D3 graph object group
            function init(newGroup:D3.Selection) {
                newGroup.append('path').attr('class', POINT_SYMBOL_CLASS);
                return newGroup;
            }

            var group:D3.Selection = graph.objectGroup(this.name, init);

            var showPoint = function(){
                if (this.symbol === 'none') {
                    return false;
                }
                return (graph.xAxis.domain.contains(this.coordinates.x) && graph.yAxis.domain.contains(this.coordinates.y));
            }();

            // draw the symbol at the point
            var pointSymbol:D3.Selection = group.select('.'+ POINT_SYMBOL_CLASS);
            if(showPoint) {
                pointSymbol
                    .attr({
                        'class': this.classAndVisibility() + ' ' + POINT_SYMBOL_CLASS,
                        'd': d3.svg.symbol().type(this.symbol).size(this.size),
                        'transform': "translate(" + graph.xAxis.scale(this.coordinates.x) + "," + graph.yAxis.scale(this.coordinates.y) + ")"
                        })
            } else {
                pointSymbol.attr('class','invisible ' + POINT_SYMBOL_CLASS);
            }

            return graph;

        }
    }



}