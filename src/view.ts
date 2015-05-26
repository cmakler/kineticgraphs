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
        // layers into which objects or text may be rendered, and selectors for those objects once placed
        masked: D3.Selection;
        unmasked: D3.Selection;
        divs: D3.Selection;
        objectGroup: (name:string, init:((newGroup:D3.Selection) => D3.Selection), unmasked:boolean) => D3.Selection;
        getDiv: (name:string) => D3.Selection;

        // axis objects and methods for checking whether a coordinate is within an axis domain
        xAxis: Axis;
        yAxis: Axis;
        xOnGraph: (x:number) => boolean;
        yOnGraph: (x:number) => boolean;

        // render given current scope
        render: (scope:IScope, redraw:boolean) => void;
        redraw: (scope:IScope) => void;
        drawObjects: (scope:IScope) => void;

        // view objects
        objects: ViewObject[];

        // method to bubble model changes to the controller from user interaction with the view
        updateParams: (any) => void;

    }

    export class View extends Model implements IView
    {
        private element_id;
        public dimensions;
        public margins;
        public masked;
        public unmasked;
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
                view.updateParams = function(params){
                    scope.updateParams(params)
                };
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
            view.dimensions.height = Math.min(view.dimensions.height, window.innerHeight - element.offsetTop);
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
            view.masked = svg.append("g").attr("transform", visTranslation);
            var mask = svg.append("g").attr("class","mask");
            view.unmasked = svg.append("g").attr("transform", visTranslation);

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

        updateParams(params) {
            console.log('updateParams called before scope applied');
        }

        objectGroup(name, init, unmasked) {
            var layer = unmasked ? this.unmasked : this.masked;
            var group = layer.select('#' + name);
            if(group.empty()) {
                group = layer.append('g').attr('id',name);
                group = init(group)
            }
            return group;
        }

        getDiv(name) {
            var selection = this.divs.select('#' + name);
            if (selection.empty()) {
                selection = this.divs.append('div').attr('id',name);
            }
            return selection;
        }

        xOnGraph(x:number) {
            return this.xAxis.domain.contains(x);
        }

        yOnGraph(y:number) {
            return this.yAxis.domain.contains(y);
        }



    }
}