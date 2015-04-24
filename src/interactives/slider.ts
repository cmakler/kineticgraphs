/// <reference path="../kg.ts"/>
/// <reference path="interactive.ts" />


module KineticGraphs
{

    // Slider Definition
    export interface ISliderDefinition extends IInteractiveDefinition
    {
        param: string;
        axis: IAxisDefinition;
    }

    export interface ISlider extends IInteractive
    {
        circle: D3.Selection;
        axis: IAxis;
    }

    export class Slider extends Interactive implements ISlider {
        public circle;
        public axis;

        constructor(public definitionString:string) {
            super(definitionString);
            this.axis = new XAxis();
        }

        redraw() {

            var slider = this,
                scope = this.scope,
                definition = this.definition,
                updateDimensions = this.updateDimensions;

            console.log('redrawing slider!');

            // Set default height to 50
            if(!definition.hasOwnProperty('dimensions')) {
                definition.dimensions = {height: 50};
            }

            // Establish dimensions of the graph
            var element = $('#' + definition.element_id)[0];
            var dimensions = updateDimensions(element.clientWidth, definition.dimensions);
            var radius = dimensions.height / 2;
            var margins = {top: radius, left: radius, bottom: radius, right: radius};

            // Update axis object
            slider.axis.update(definition.axis);

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
                    scope.params[definition.param] = slider.axis.scale.invert(d3.event.x);
                    scope.$apply();
                });

            slider.circle = slider.vis.append('circle').attr({cy: 0, r: radius}).call(drag);

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