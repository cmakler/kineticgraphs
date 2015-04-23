/**
 * Created by cmakler on 4/8/15.
 */

module KineticGraphs
{

    export interface IPoint extends IGraphObject {
        coordinates: ICoordinates;
        symbol?: string;
        size?: number;
    }

    export class Point extends GraphObject implements IPoint
    {

        public show;
        public name;
        public className;

        public coordinates;
        public symbol;
        public size;



        constructor() {
            super();
            this.coordinates = {x: 0, y: 0};
            this.size = 100;
            this.symbol = 'circle';
        }

        render(graph) {

            // constants TODO should these be defined somewhere else?
            var POINT_SYMBOL_CLASS = 'pointSymbol';

            // generate render-specific variables
            var x = graph.xAxis.scale(this.coordinates.x),
                y = graph.yAxis.scale(this.coordinates.y);

            // initialization of D3 graph object group
            function init(newGroup:D3.Selection) {
                newGroup.append('path').attr('class', POINT_SYMBOL_CLASS);
                return newGroup;
            }

            var group:D3.Selection = graph.objectGroup(this.name, init);

            // draw the symbol at the point
            var pointSymbol:D3.Selection = group.select('.'+ POINT_SYMBOL_CLASS);
            if(this.symbol === 'none') {
                pointSymbol.attr('class','invisible ' + POINT_SYMBOL_CLASS);
            } else {
                pointSymbol.attr({
                    'class': this.classAndVisibility() + ' ' + POINT_SYMBOL_CLASS,
                    'd': d3.svg.symbol().type(this.symbol).size(this.size),
                    'transform': "translate(" + x + "," + y + ")"
                });
            }

            return graph;

        }
    }



}