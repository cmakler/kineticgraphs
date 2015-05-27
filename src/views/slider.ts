/// <reference path="../kg.ts"/>

'use strict';

module KG
{

    // Slider Definition
    export interface ISliderDefinition extends IViewDefinition
    {
        param: string;
        precision: number;
        axis: IAxisDefinition;
    }

    export interface ISlider extends IView
    {
        circle: D3.Selection;
        axis: IAxis;
    }

    export class Slider extends View implements ISlider {
        public circle;
        public axis;

        constructor(public definition: ISliderDefinition) {
            definition = _.defaults(definition,{
                height: 50,
                width: 300,
                precision: 1,
            })
            super(definition);
            this.axis = new XAxis();
        }

        redraw() {

            var slider = this,
                scope = this.scope,
                definition = this.definition,
                updateDimensions = this.updateDimensions;

            console.log('redrawing slider!');

            // Establish dimensions of the graph
            var element = $('#' + definition.element_id)[0];
            var dimensions = updateDimensions(element.clientWidth, definition.dimensions);
            var radius = dimensions.height / 2;
            var margins = {top: radius, left: radius, bottom: radius, right: radius};

            // Update axis object
            slider.axis.update(definition.axis);
            //slider.axis.tickValues = slider.axis.domain.toArray();

            // Remove existing slider
            d3.select(element).select('svg').remove();

            // Create new SVG element for the graph visualization
            slider.vis = d3.select(element)
                .append("svg")
                .attr("width", dimensions.width)
                .attr("height", dimensions.height)
                .append("g")
                .attr("transform", "translate(" + radius + "," + radius + ")");

            // Establish dimensions of axes (element dimensions minus margins)
            var axisDimensions = {
                width: dimensions.width - margins.left - margins.right,
                height: 0
            };

            // draw axes
            slider.axis.draw(slider.vis, axisDimensions);

            // establish drag behavior
            var drag = d3.behavior.drag()
                .on("drag", function () {
                    var rawValue = slider.axis.scale.invert(d3.event.x);
                    var boundedValue = Math.max(slider.axis.domain.min,Math.min(slider.axis.domain.max, rawValue));
                    scope.params[definition.param] = Math.round(boundedValue/definition.precision)*definition.precision;
                    scope.$apply();
                });

            slider.circle = slider.vis.append('circle').attr({cy: 0, r: radius/2}).call(drag);

            return slider;
        }

        drawObjects() {
            var circle = this.circle,
                scale = this.axis.scale,
                newValue = this.scope.params[this.definition.param];

            circle.attr('cx',scale(newValue));

            return this;
        }
    }




}