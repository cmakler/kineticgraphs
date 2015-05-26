/// <reference path="../kg.ts"/>

module KineticGraphs
{

    export interface PointDefinition extends ViewObjectDefinition {
        coordinates: ICoordinates;
        symbol?: string;
        size?: number;
        label?: string;
    }

    export interface IPoint extends IViewObject {

        // point-specific attributes
        coordinates: ICoordinates;
        symbol: string;
        size: number;
        label: string;

        //labelDiv: IGraphDiv;
        //renderLabel: (graph:IGraph) => void;
    }

    export class Point extends ViewObject implements IPoint
    {

        // point-specific attributes
        public coordinates;
        public symbol;
        public size;
        public label;
        public labelDiv;

        constructor(definition:PointDefinition) {

            definition = _.defaults(definition, {coordinates: {x:0,y:0}, size: 100, symbol: 'circle', label: ''});
            super(definition);

            //this.labelDiv = new GraphDiv({coordinates: definition.coordinates, label: definition.label});
        }

        render(view) {

            var point = this,
                label = this.label;

            // constants TODO should these be defined somewhere else?
            var POINT_SYMBOL_CLASS = 'pointSymbol';

            // initialization of D3 graph object group
            function init(newGroup:D3.Selection) {
                newGroup.append('path').attr('class', POINT_SYMBOL_CLASS);
                return newGroup;
            }

            var group:D3.Selection = view.objectGroup(point.name, init, true);

            var showPoint = function(){
                if (point.symbol === 'none') {
                    return false;
                }
                return view.onGraph(point.coordinates);
            }();

            // draw the symbol at the point
            var pointSymbol:D3.Selection = group.select('.'+ POINT_SYMBOL_CLASS);
            if(showPoint) {
                pointSymbol
                    .attr({
                        'class': point.classAndVisibility() + ' ' + POINT_SYMBOL_CLASS,
                        'd': d3.svg.symbol().type(point.symbol).size(point.size),
                        'transform': view.translateByCoordinates(point.coordinates)
                    });
                //point.labelDiv.update({name: point.name+'-label', coordinates: point.coordinates, text: point.label}).render(graph);
            } else {
                pointSymbol.attr('class','invisible ' + POINT_SYMBOL_CLASS);
                //TODO make label disappear
            }

            return view;

        }
    }



}