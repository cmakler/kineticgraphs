/// <reference path="../kg.ts"/>

'use strict';

module KG
{

    // Slider Definition
    export interface SliderDefinition extends ViewDefinition
    {
        param: string;
        precision: number;
        axisDef: AxisDefinition;
    }

    export interface ISlider extends IView
    {

    }

    export class Slider extends View implements ISlider {
        public axisDef;

        constructor(definition: SliderDefinition, modelPath?: string) {

            definition.maxDimensions = _.defaults(definition.maxDimensions || {}, { width: 500, height: 50 });
            definition.margins = _.defaults(definition.margins || {}, {top: 25, left: 25, bottom: 25, right: 25});
            definition.mask = false;

            super(definition, modelPath);
            this.xAxis = new XAxis(definition.axisDef);
            this.objects = [
                new SliderControl({name: definition.element_id + 'Ctrl', param: 'params.' + definition.param})
            ]
        }

        _update(scope) {
            this.xAxis.update(scope);
            super._update(scope);
            return this;
        }

        onGraph(coordinates) {
            return true;
        }



    }

    export class SliderControl extends ViewObject {

        public param;

        constructor(definition, modelPath?: string) {
            definition.xDrag = true;
            definition.yDrag = false;
            definition.coordinates = {x: definition.param, y:0};
            super(definition, modelPath);
            this.viewObjectSVGtype = 'g';
            this.viewObjectClass = 'sliderControl';
        }

        render(view) {

            var control = this;

            var group:D3.Selection = view.objectGroup(control.name, control.initGroupFn(), true);

            if(!group) {
                return view;
            }

            var controlGroup:D3.Selection = group.select('.'+ control.viewObjectClass);

            var controlSquare = controlGroup.selectAll('rect').data([0])

            controlSquare.enter().append('rect').attr({
                opacity: 0,
                y: -view.dimensions.height*0.5,
                width: 50,
                height: view.dimensions.height
            });

            controlSquare.attr({
                'x': view.xAxis.scale(control.param) - 25
            });

            var controlCircle = controlGroup.selectAll('circle').data([0])

            controlCircle.enter().append('circle').attr({
                'class': control.classAndVisibility(),
                'r': view.dimensions.height/5,
                'cy': 0
            });

            controlCircle.attr({
                'cx': view.xAxis.scale(control.param)
            });

            control.setDragBehavior(view,controlSquare);
            control.setDragBehavior(view,controlCircle);

            return control;

        }
    }




}