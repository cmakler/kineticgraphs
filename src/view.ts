/// <reference path='kg.ts'/>

'use strict';

module KG
{
    export interface ViewDefinition extends ModelDefinition
    {
        element_id: string;
        dimensions: IDimensions;
        margins: IMargins;
        xAxis?: AxisDefinition;
        yAxis?: AxisDefinition;
        objects?: ViewObjectDefinition[];
        background: string;
        mask?: boolean;
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
        public background;
        private mask;

        constructor(definition:ViewDefinition) {
            definition = _.defaults(definition,{background:'white',mask:true});
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

            // Establish dimensions of the view
            var element = $('#' + view.element_id)[0];
            view.dimensions.width = Math.min(view.dimensions.width, element.clientWidth);
            view.dimensions.height = Math.min(view.dimensions.height, window.innerHeight - element.offsetTop);
            var frameTranslation = KG.positionByPixelCoordinates({x:(element.clientWidth - view.dimensions.width)/2,y:0});
            var visTranslation = KG.translateByPixelCoordinates({x:view.margins.left, y:view.margins.top});

            d3.select(element).select('div').remove();

            // Create new div element to contain SVG
            var frame = d3.select(element).append('div').attr({style: frameTranslation});

            // Create new SVG element for the view visualization
            var svg = frame.append('svg')
                .attr('width', view.dimensions.width)
                .attr('height', view.dimensions.height);

            // Establish marker style for arrow
            svg.append("svg:defs").selectAll("marker").data(["red","gray","blue","purple"]).enter()
                .append("marker")
                .attr("id", function(d){return "arrow-end-" + d})
                .attr("refX", 11)
                .attr("refY", 6)
                .attr("markerWidth", 13)
                .attr("markerHeight", 13)
                .attr("orient", "auto")
                .attr("markerUnits","userSpaceOnUse")
                .append("svg:path")
                .attr("d", "M2,2 L2,11 L10,6 L2,2")
                .attr("fill",function(d) {return d});

            // Establish marker style for arrow
            svg.append("svg:defs").selectAll("marker").data(["red","gray","blue","purple"]).enter()
                .append("svg:marker")
                .attr("id", function(d){return "arrow-start-" + d})
                .attr("refX", 2)
                .attr("refY", 6)
                .attr("markerWidth", 13)
                .attr("markerHeight", 13)
                .attr("orient", "auto")
                .attr("markerUnits","userSpaceOnUse")
                .append("svg:path")
                .attr("d", "M11,2 L11,11 L2,6 L11,2")
                .attr("fill",function(d) {return d});

            // Add a div above the SVG for labels and controls
            view.divs = frame.append('div').attr({style: visTranslation});

            if(view.mask){

                // Establish SVG groups for visualization area (vis), mask, axes
                view.masked = svg.append('g').attr('transform', visTranslation);
                var mask = svg.append('g').attr('class','mask');

                // Put mask around vis to clip objects that extend beyond the desired viewable area
                mask.append('rect').attr({x: 0, y: 0, width: view.dimensions.width, height: view.margins.top, fill:view.background});
                mask.append('rect').attr({x: 0, y: view.dimensions.height - view.margins.bottom, width: view.dimensions.width, height: view.margins.bottom, fill:view.background});
                mask.append('rect').attr({x: 0, y: 0, width: view.margins.left, height: view.dimensions.height, fill:view.background});
                mask.append('rect').attr({x: view.dimensions.width - view.margins.right, y: 0, width: view.margins.right, height: view.dimensions.height, fill:view.background});

            }

            if(view.xAxis || view.yAxis) {

                // Establish SVG group for axes
                var axes = svg.append('g').attr('class','axes').attr('transform', visTranslation);

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

            // Establish SVG group for objects that lie above the axes (e.g., points and labels)
            view.unmasked = svg.append('g').attr('transform', visTranslation);

            return view.drawObjects(scope);
        }

        drawObjects(scope) {
            var view = this;
            view.objects.forEach(function(object) {object.createSubObjects(view)});
            view.objects.forEach(function(object) {object.update(scope).render(view)});
            return view;
        }

        addObject(newObj) {
            this.objects.push(newObj);
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

        drag(xParam:string, yParam:string, xDelta:number, yDelta:number) {

            var view = this;
            var xAxis = view.xAxis;
            var yAxis = view.yAxis;

            return d3.behavior.drag()
                .on('drag', function () {
                    d3.event.sourceEvent.preventDefault();
                    var dragUpdate = {}, newX, newY;
                    if(xParam !== null) {
                        newX = xAxis.scale.invert(d3.event.x + xDelta);
                        if(newX < xAxis.domain.min) {
                            dragUpdate[xParam] = xAxis.domain.min;
                        } else if(newX > xAxis.domain.max) {
                            dragUpdate[xParam] = xAxis.domain.max;
                        } else {
                            dragUpdate[xParam] = newX;
                        }
                    }
                    if(yParam !== null) {
                        newY = yAxis.scale.invert(d3.event.y + yDelta);
                        if(newY < yAxis.domain.min) {
                            dragUpdate[yParam] = yAxis.domain.min;
                        } else if(newY > xAxis.domain.max) {
                            dragUpdate[yParam] = yAxis.domain.max;
                        } else {
                            dragUpdate[yParam] = newY;
                        }
                    }
                    view.updateParams(dragUpdate)
                });
        }

    }
}