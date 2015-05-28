/// <reference path="../kg.ts"/>

'use strict';

module KG
{

    export interface PointDefinition extends ViewObjectDefinition {
        coordinates: ICoordinates;
        symbol?: string;
        size?: number;
        label?: string;
    }

    export interface IPoint extends IViewObject {

        // point-specific attributes
        symbol: string;
        size: number;
        label: string;
        labelDiv: IGraphDiv;
    }

    export class Point extends ViewObject implements IPoint
    {

        // point-specific attributes
        public symbol;
        public size;
        public label;
        public labelDiv;

        constructor(definition:PointDefinition) {

            definition = _.defaults(definition, {coordinates: {x:0,y:0}, size: 100, symbol: 'circle'});
            super(definition);

            if(definition.label) {
                this.labelDiv = new GraphDiv(definition);
            }

            this.viewObjectSVGtype = 'path';
            this.viewObjectClass = 'pointSymbol';
        }

        createSubObjects(view) {
            var labelDiv = this.labelDiv;
            if(labelDiv) {
                return view.addObject(labelDiv);
            } else {
                return view;
            }
        }

        render(view) {

            var point = this,
                draggable = (point.xDrag || point.yDrag);

            var group:D3.Selection = view.objectGroup(point.name, point.initGroupFn(), true);

            if (point.symbol === 'none') {
                point.show = false;
                point.labelDiv.show = false;
            }

            // draw the symbol at the point
            var pointSymbol:D3.Selection = group.select('.'+ point.viewObjectClass);
            pointSymbol
                .attr({
                    'class': point.classAndVisibility(),
                    'd': d3.svg.symbol().type(point.symbol).size(point.size),
                    'transform': view.translateByCoordinates(point.coordinates)
                });

            if(draggable){
                return point.setDragBehavior(view,pointSymbol);
            } else {
                return view;
            }

            return view;

        }
    }



}