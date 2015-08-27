/// <reference path="../kg.ts"/>

'use strict';

module KG
{

    // Slider Definition
    export interface SliderDefinition extends ViewDefinition
    {
        param: string;
        precision: number;
        axis: AxisDefinition;
    }

    export interface ISlider extends IView
    {

    }

    export class Slider extends View implements ISlider {
        public axis;

        constructor(definition: SliderDefinition) {

            definition.maxDimensions = _.defaults(definition.maxDimensions || {}, { width: 500, height: 50 });
            definition.margins = _.defaults(definition.margins || {}, {top: 25, left: 25, bottom: 25, right: 25});
            definition.mask = false;

            super(definition);
            this.xAxis = new XAxis(definition.axis);
            this.objects = [
                new SliderControl({name: definition.element_id + 'Ctrl', param: 'params.' + definition.param})
            ]
        }

        _update(scope) {
            this.xAxis.update(scope);
            return this;
        }



    }

    export class SliderControl extends ViewObject {

        public param;

        constructor(definition) {
            definition.xDrag = true;
            definition.yDrag = false;
            definition.coordinates = {x: definition.param, y:0};
            super(definition);
            this.viewObjectSVGtype = 'circle';
            this.viewObjectClass = 'sliderControl';
        }

        render(view) {

            var control = this;

            var group:D3.Selection = view.objectGroup(control.name, control.initGroupFn(), true);

            var controlCircle:D3.Selection = group.select('.'+ control.viewObjectClass);

            controlCircle
                .attr({
                    'class': control.classAndVisibility(),
                    'r': view.dimensions.height/3,
                    'cx': view.xAxis.scale(control.param),
                    'cy': 0
                });

            return control.setDragBehavior(view,controlCircle)

        }
    }




}