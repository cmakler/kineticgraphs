/// <reference path="../kg.ts"/>

'use strict';

module KG
{

    export interface PointDefinition extends ViewObjectDefinition {
        symbol?: string;
        size?: number;
        label?: GraphDivDefinition;
        droplines?: any;
    }

    export interface IPoint extends IViewObject {

        // point-specific attributes
        symbol: string;
        size: number;
        labelDiv: IGraphDiv;
        horizontalDropline: Segment;
        verticalDropline: Segment;
    }

    export class Point extends ViewObject implements IPoint
    {

        // point-specific attributes
        public symbol;
        public size;
        public labelDiv;
        public color;
        public horizontalDropline;
        public verticalDropline;

        constructor(definition:PointDefinition) {

            definition = _.defaults(definition, {coordinates: {x:0,y:0}, size: 100, symbol: 'circle'});
            super(definition);

            if(definition.label) {
                var labelDef = _.defaults(definition.label, {
                    name: definition.name + '_label',
                    coordinates:definition.coordinates,
                    xDrag: definition.xDrag,
                    yDrag: definition.yDrag
                });
                labelDef.color = (labelDef.hasOwnProperty('align')) ? this.color : 'white';
                this.labelDiv = new GraphDiv(labelDef);
            }

            if(definition.droplines) {
                if(definition.droplines.hasOwnProperty('horizontal')) {
                    this.horizontalDropline = new HorizontalDropline({
                        name: definition.name,
                        coordinates: definition.coordinates,
                        draggable: definition.yDrag,
                        axisLabel: definition.droplines.horizontal,

                    });
                }
                if(definition.droplines.hasOwnProperty('vertical')) {
                    this.verticalDropline = new VerticalDropline({
                        name: definition.name,
                        coordinates: definition.coordinates,
                        draggable: definition.xDrag,
                        axisLabel: definition.droplines.vertical
                    });
                }
            }

            this.viewObjectSVGtype = 'path';
            this.viewObjectClass = 'pointSymbol';
        }

        createSubObjects(view) {
            var p = this;
            if(p.labelDiv) {
                view.addObject(p.labelDiv);
            }
            if(p.verticalDropline) {
                view.addObject(p.verticalDropline);
                p.verticalDropline.createSubObjects(view); // TODO should probably make this more recursive by default
            }
            if(p.horizontalDropline) {
                view.addObject(p.horizontalDropline);
                p.horizontalDropline.createSubObjects(view); // TODO should probably make this more recursive by default
            }
            return view;
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
                    'fill': point.color,
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