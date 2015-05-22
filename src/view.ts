/// <reference path="kg.ts"/>

module KineticGraphs
{
    export interface ViewDefinition extends ModelDefinition
    {
        element_id: string;
        dimensions: IDimensions;
        margins: IMargins;
        xAxis?: AxisDefinition;
        yAxis?: AxisDefinition;
        objects?: ViewObjectDefinition[];
    }

    export interface IView extends IModel
    {
        vis: D3.Selection;
        divs: D3.Selection;
        xAxis: Axis;
        yAxis: Axis;
        objects: ViewObject[];

        render: (scope:IScope, redraw:boolean) => void;
        redraw: (scope:IScope) => void;
        drawObjects: (scope:IScope) => void;

    }

    export class View extends Model implements IView
    {
        private element_id;
        public dimensions;
        public margins;
        public vis;
        public divs;
        public xAxis;
        public yAxis;
        public objects;

        constructor(definition:ViewDefinition) {
            super(definition);
            if(definition.hasOwnProperty('xAxis')){
                this.xAxis = new XAxis(definition.xAxis);
            }
            if(definition.hasOwnProperty('yAxis')){
                this.yAxis = new YAxis(definition.yAxis);
            }
        }

        render(scope, redraw) {

            var view = this;
            view.update(scope, function(){
                if(redraw){
                    view.redraw(scope);
                } else {
                    view.drawObjects(scope);
                }
            });
        }

        redraw(scope) {
            var view = this;

            // Redraw the view if necessary
            console.log('redrawing view!');

            // Establish dimensions of the view
            var element = $('#' + view.element_id)[0];
            view.dimensions.width = Math.min(view.dimensions.width, element.clientWidth);
            var frameTranslation = KineticGraphs.positionByPixelCoordinates({x:0,y:0});
            var visTranslation = KineticGraphs.translateByPixelCoordinates({x:view.margins.left, y:view.margins.top});

            d3.select(element).select('div').remove();

            // Create new div element to contain SVG
            var frame = d3.select(element).append('div').attr({style: frameTranslation});

            // Create new SVG element for the view visualization
            var svg = frame.append("svg")
                .attr("width", view.dimensions.width)
                .attr("height", view.dimensions.height);

            // Add a div above the SVG for labels and controls
            view.divs = frame.append('div').attr({style: visTranslation});

            // Establish SVG groups for visualization area (vis), mask, axes
            view.vis = svg.append("g").attr("transform", visTranslation);
            var mask = svg.append("g").attr("class","mask");


            // Put mask around vis to clip objects that extend beyond the desired viewable area
            mask.append("rect").attr({x: 0, y: 0, width: view.dimensions.width, height: view.margins.top});
            mask.append("rect").attr({x: 0, y: view.dimensions.height - view.margins.bottom, width: view.dimensions.width, height: view.margins.bottom});
            mask.append("rect").attr({x: 0, y: 0, width: view.margins.left, height: view.dimensions.height});
            mask.append("rect").attr({x: view.dimensions.width - view.margins.right, y: 0, width: view.margins.right, height: view.dimensions.height});

            if(view.xAxis || view.yAxis) {

                // Establish SVG group for axes
                var axes = svg.append("g").attr("class","axes").attr("transform", visTranslation);

                // Establish dimensions of axes (element dimensions minus margins)
                var axisDimensions = {
                    width: view.dimensions.width - view.margins.left - view.margins.right,
                    height: view.dimensions.height - view.margins.top - view.margins.bottom
                };

                // draw axes
                if(view.xAxis) {
                    view.xAxis.draw(axes,axisDimensions);
                }
                if(view.yAxis) {
                    view.yAxis.draw(axes,axisDimensions);
                }

            }

            return view.drawObjects(scope);
        }

        drawObjects(scope) {
            var view = this;
            view.objects.forEach(function(object) {object.update(scope).render(view)});
            return view;
        }

    }
}