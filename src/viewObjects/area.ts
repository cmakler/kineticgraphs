/// <reference path="../kg.ts"/>

'use strict';

module KG {

    export interface AreaDefinition extends ViewObjectDefinition {
        data?: any;
        interpolation?: string;
        label?: GraphDivDefinition;
        labelPosition?: string;
    }

    export interface IArea extends IViewObject {

        data: ICoordinates[];
        interpolation: string;

        labelDiv: IGraphDiv;
        labelPosition: string;
        positionLabel: (view:IView) => void;

    }

    export class Area extends ViewObject implements IArea {

        public data;
        public interpolation;

        public label;
        public labelPosition;
        public labelDiv;

        constructor(definition:AreaDefinition, modelPath?: string) {

            definition = _.defaults(definition, {data: [], interpolation: 'linear'});

            super(definition, modelPath);

            if(definition.label) {
                var labelDef = _.defaults(definition.label, {
                    name: definition.name + '_label',
                    className: definition.className,
                    xDrag: definition.xDrag,
                    yDrag: definition.yDrag,
                    color: definition.color,
                    show: definition.show
                });
                //console.log(labelDef);
                this.labelDiv = new GraphDiv(labelDef);
            }

            this.viewObjectSVGtype = 'path';
            this.viewObjectClass = 'area';
        }

        createSubObjects(view) {
            var labelDiv = this.labelDiv;
            if(labelDiv) {
                return view.addObject(labelDiv);
            } else {
                return view;
            }
        }

        positionLabel(view) {
            var area = this;
            if(area.labelDiv) {
                area.labelDiv.coordinates = view.modelCoordinates(KG.arrayAverage(area.data));
            }
        }

        render(view) {

            var area = this;

            area.updateDataForView(view);

            var dataCoordinates:ICoordinates[] = view.dataCoordinates(area.data);

            var group:D3.Selection = view.objectGroup(area.name, area.initGroupFn(), false);

            area.positionLabel(view);

            var dataLine = d3.svg.line()
                .interpolate(this.interpolation)
                .x(function (d) { return d.x })
                .y(function (d) { return d.y });

            var dataPath:D3.Selection = group.select('.' + area.viewObjectClass);

            dataPath
                .attr({
                    'class': area.classAndVisibility(),
                    'd': dataLine(dataCoordinates)
                })
                .style('fill',KG.colorForClassName(area.className, 'light'))
                .style('opacity',0.5)

            return view;
        }

    }

}