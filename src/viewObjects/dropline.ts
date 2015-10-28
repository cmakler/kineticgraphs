/// <reference path="../kg.ts"/>

'use strict';

module KG {

    export interface DroplineDefinition extends ViewObjectDefinition {
        coordinates: ICoordinates;
        horizontal?: boolean;
        draggable?: boolean;
        axisLabel?: string;
    }

    export interface IDropline extends IViewObject {
        coordinates: ICoordinates;
        horizontal: boolean;
        draggable: boolean;
        labelDiv: IGraphDiv;
    }

    export class Dropline extends ViewObject implements IDropline {

        public coordinates;
        public horizontal;
        public draggable;
        public labelDiv;

        constructor(definition:DroplineDefinition, modelPath?: string) {

            definition.coordinates = KG.getCoordinates(definition.coordinates);
            definition = _.defaults(definition,{
                horizontal: false,
                draggable: false,
                axisLabel: ''
            });
            super(definition,modelPath);

            if(definition.axisLabel.length > 0) {
                var labelDef:GraphDivDefinition = {
                    name: definition.name + '_label',
                    className: definition.className,
                    text: definition.axisLabel,
                    dimensions: {width: 60, height:20},
                    backgroundColor: 'white',
                    show: definition.show
                };

                if(definition.horizontal) {
                    labelDef.coordinates = {
                        x: KG.GraphDiv.AXIS_COORDINATE_INDICATOR,
                        y: definition.coordinates.y
                    };
                    labelDef.yDrag = definition.draggable;
                } else {
                    labelDef.coordinates = {
                        x: definition.coordinates.x,
                        y: KG.GraphDiv.AXIS_COORDINATE_INDICATOR
                    };
                    labelDef.xDrag = definition.draggable;
                }

                this.labelDiv = new GraphDiv(labelDef);
            }

            this.viewObjectSVGtype = 'line';
            this.viewObjectClass = 'dropline';
        }

        createSubObjects(view,scope) {
            var p = this;
            if(p.labelDiv) {
                view.addObject(p.labelDiv.update(scope));
            }
            return view;
        }

        render(view) {

            var dropline = this;

            var pointX = view.xAxis.scale(dropline.coordinates.x),
                pointY = view.yAxis.scale(dropline.coordinates.y),
                anchorX = dropline.horizontal ? view.xAxis.scale(view.xAxis.min) : pointX,
                anchorY = dropline.horizontal ? pointY : view.yAxis.scale(view.yAxis.min);

            if(isNaN(pointX) || isNaN(pointY)) {
                return view;
            }

            var group:D3.Selection = view.objectGroup(dropline.name, dropline.initGroupFn(), false);

            var droplineSelection:D3.Selection = group.select('.'+ dropline.viewObjectClass);

            droplineSelection
                .attr({
                    'x1': anchorX,
                    'y1': anchorY,
                    'x2': pointX,
                    'y2': pointY,
                    'class': dropline.classAndVisibility()
                });

            return view;
        }

    }

    export class VerticalDropline extends Dropline {

        constructor(definition, modelPath?: string) {
            definition.name += '_vDropline';
            definition.horizontal = false;
            super(definition, modelPath);
        }
    }

    export class HorizontalDropline extends Dropline {

        constructor(definition, modelPath?: string) {
            definition.name += '_hDropline';
            definition.horizontal = true;
            super(definition, modelPath);
        }
    }

}