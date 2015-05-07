/// <reference path="../kg.ts"/>
/// <reference path="graphObjects.ts"/>

module KineticGraphs
{

    export interface IPoint extends IGraphObject {

        // point-specific attributes
        coordinates: ICoordinates;
        symbol?: string;
        size?: number;
        label: string;
        labelDiv?: IGraphDiv;
        renderLabel: (graph:IGraph) => void;
    }

    export class Point extends GraphObject implements IPoint
    {

        // point-specific attributes
        public coordinates;
        public symbol;
        public size;
        public label;
        public labelDiv;

        constructor() {

            super();

            // establish defaults
            this.coordinates = {x: 0, y: 0};
            this.size = 100;
            this.symbol = 'circle';
            this.labelDiv = new GraphDiv();
            this.label = '';
        }

        render(graph) {

            var point = this,
                label = this.label;

            // constants TODO should these be defined somewhere else?
            var POINT_SYMBOL_CLASS = 'pointSymbol';

            // initialization of D3 graph object group
            function init(newGroup:D3.Selection) {
                newGroup.append('path').attr('class', POINT_SYMBOL_CLASS);
                return newGroup;
            }

            var group:D3.Selection = graph.objectGroup(point.name, init);

            var showPoint = function(){
                if (point.symbol === 'none') {
                    return false;
                }
                return graph.onGraph(point.coordinates);
            }();

            // draw the symbol at the point
            var pointSymbol:D3.Selection = group.select('.'+ POINT_SYMBOL_CLASS);
            if(showPoint) {
                pointSymbol
                    .attr({
                        'class': point.classAndVisibility() + ' ' + POINT_SYMBOL_CLASS,
                        'd': d3.svg.symbol().type(point.symbol).size(point.size),
                        'transform': graph.translateByCoordinates(point.coordinates)
                    });
                point.labelDiv.update({name: point.name+'-label', coordinates: point.coordinates, text: point.label}).render(graph);
            } else {
                pointSymbol.attr('class','invisible ' + POINT_SYMBOL_CLASS);
                //TODO make label disappear
            }

            return graph;

        }

        renderLabel(graph) {

        }
    }



}