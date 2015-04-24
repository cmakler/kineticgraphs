/// <reference path="kg.ts"/>
/// <reference path="helpers.ts"/>
/// <reference path="axis.ts"/>

module KineticGraphs
{

    // Slider Definition
    export interface ISliderDefinition
    {
        element_id: string;
        param: string;
        dimensions?: IDimensions;
        axis: IAxisDefinition;
    }

    // Slider Class
    // Additions to the scope of a graph
    export interface ISlider
    {
        scope: IModelScope;
        sliderDefinition: ISliderDefinition;

        element: JQuery;
        vis: D3.Selection;
        circle: D3.Selection;

        axis: IAxis;

        updateSlider: (sliderDefinition:ISliderDefinition, scope: IModelScope, redraw: boolean) => ISlider;
    }

    export class Slider implements ISlider
    {
        public element;
        public vis;
        public circle;

        public axis;

        constructor(public scope:IModelScope, public sliderDefinition:ISliderDefinition) {
            this.axis = new XAxis();
            if(sliderDefinition){
                this.updateSlider(sliderDefinition, scope, true);
            }
        }

        updateSlider(sliderDefinition, scope, redraw) {

            this.scope = scope;
            var slider = this;

            // Set redraw to true by default
            if(redraw == undefined) { redraw = true }

            // Rules for updating the dimensions fo the graph object, based on current graph element clientWidth
            function updateDimensions(clientWidth: number, dimensions?: IDimensions) {

                // Set default to the width of the enclosing element, with a height of 40
                var newDimensions: IDimensions = {width: clientWidth, height: 50};

                // If the author has specified a height, override
                if (dimensions && dimensions.hasOwnProperty('height')) {
                    newDimensions.height = dimensions.height;
                }

                // If the author has specified a width less than the graph element clientWidth, override
                if(dimensions && dimensions.hasOwnProperty('width') && dimensions.width < clientWidth) {
                    newDimensions.width = dimensions.width;
                }

                return newDimensions;
            }

            // Redraw the graph if necessary
            if(redraw) {

                console.log('redrawing slider!');

                // Establish dimensions of the graph
                var element = $('#' + sliderDefinition.element_id)[0];
                var dimensions = updateDimensions(element.clientWidth, sliderDefinition.dimensions);
                var radius = dimensions.height / 2;
                var margins = {top: radius, left: radius, bottom: radius, right: radius};

                // Update axis object
                slider.axis.update(sliderDefinition.axis);

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
                slider.axis.draw(slider.vis,axisDimensions);

                // establish drag behavior
                var drag = d3.behavior.drag()
                    .on("drag", function () {
                        scope.params[sliderDefinition.param] = slider.axis.scale.invert(d3.event.x);
                        scope.$apply();
                    });

                slider.circle = slider.vis.append('circle').attr({cy:0, r:radius}).call(drag);

            }

            slider.circle.attr('cx',slider.axis.scale(scope.params[sliderDefinition.param]))

            return slider;

        }
    }
}