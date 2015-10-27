/// <reference path="../kg.ts"/>

'use strict';

module KG
{

    export interface PointParamsDefinition extends ViewObjectParamsDefinition {
        label?:string;
        xAxisLabel?:string;
        yAxisLabel?:string;
        xDragParam?:string;
        yDragParam?:string;
    }

    export interface PointDefinition extends ViewObjectDefinition {
        symbol?: string;
        size?: number;
        label?: GraphDivDefinition;
        droplines?: any;
        params?: PointParamsDefinition;
    }

    export interface IPoint extends IViewObject {

        // point-specific attributes
        symbol: string;
        size: number;
        labelDiv: IGraphDiv;
        horizontalDropline: Segment;
        verticalDropline: Segment;
    }

    export class Point extends ViewObject implements IPoint
    {

        // point-specific attributes
        public symbol;
        public size;
        public labelDiv;
        public color;
        public horizontalDropline;
        public verticalDropline;

        constructor(definition:PointDefinition, modelPath?: string) {

            if(definition.hasOwnProperty('params')) {

                var p = definition.params;

                if(p.hasOwnProperty('label')) {
                    definition.label = {
                        text: p.label
                    }
                }

                if(p.hasOwnProperty('xAxisLabel') || p.hasOwnProperty('yAxisLabel')) {
                    if(!definition.hasOwnProperty('droplines')) {
                        definition.droplines = {}
                    }
                    if(p.hasOwnProperty('xAxisLabel')) {
                        definition.droplines.vertical = p.xAxisLabel;
                    }
                    if(p.hasOwnProperty('yAxisLabel')) {
                        definition.droplines.horizontal = p.yAxisLabel;
                    }
                }

                if(p.hasOwnProperty('xDragParam')) {
                    definition.xDrag = 'params.' + p.xDragParam;
                }

                if(p.hasOwnProperty('yDragParam')) {
                    definition.yDrag = 'params.' + p.yDragParam;
                }

            }

            var defaultSize = 100;

            if(definition.hasOwnProperty('label')) {
                if(definition.label.hasOwnProperty('text')) {
                    if(definition.label.text.length > 0) {
                        defaultSize = 500;
                    }
                }
            }

            definition = _.defaults(definition, {
                coordinates: {x:0,y:0},
                size: defaultSize,
                symbol: 'circle'
            });

            super(definition, modelPath);

            if(definition.label) {
                var labelDef = _.defaults(definition.label, {
                    name: definition.name + '_label',
                    coordinates:definition.coordinates,
                    xDrag: definition.xDrag,
                    yDrag: definition.yDrag,
                    show: definition.show
                });
                if(!labelDef.hasOwnProperty('align')) {
                    labelDef.className = 'pointLabel'
                }
                this.labelDiv = new GraphDiv(labelDef);
            }

            if(definition.droplines) {
                if(definition.droplines.hasOwnProperty('horizontal')) {
                    this.horizontalDropline = new HorizontalDropline({
                        name: definition.name,
                        coordinates: definition.coordinates,
                        draggable: definition.yDrag,
                        axisLabel: definition.droplines.horizontal,
                        className: definition.className,
                        show: definition.show
                    });
                }
                if(definition.droplines.hasOwnProperty('vertical')) {
                    this.verticalDropline = new VerticalDropline({
                        name: definition.name,
                        coordinates: definition.coordinates,
                        draggable: definition.xDrag,
                        axisLabel: definition.droplines.vertical,
                        className: definition.className,
                        show: definition.show
                    });
                }
            }

            this.viewObjectSVGtype = 'path';
            this.viewObjectClass = 'pointSymbol';
        }

        createSubObjects(view,scope) {
            var p = this;
            if(view instanceof KG.TwoVerticalGraphs) {
                if(p.labelDiv) {
                    view.topGraph.addObject(p.labelDiv.update(scope));
                }
                if(p.verticalDropline) {
                    var continuationDropLine = new VerticalDropline({
                        name: p.verticalDropline.name,
                        className: p.verticalDropline.className,
                        coordinates: {x: p.verticalDropline.definition.coordinates.x, y: view.bottomGraph.yAxis.domain.max},
                        draggable: p.verticalDropline.draggable,
                        axisLabel: p.verticalDropline.axisLabel
                    });
                    p.verticalDropline.labelDiv = null;
                    view.topGraph.addObject(p.verticalDropline.update(scope));
                    view.bottomGraph.addObject(continuationDropLine.update(scope));
                    p.verticalDropline.createSubObjects(view.topGraph,scope); // TODO should probably make this more recursive by default
                    continuationDropLine.createSubObjects(view.bottomGraph,scope);
                }
                if(p.horizontalDropline) {
                    view.topGraph.addObject(p.horizontalDropline.update(scope));
                    p.horizontalDropline.createSubObjects(view.topGraph,scope); // TODO should probably make this more recursive by default
                }
            } else {
                if(p.labelDiv) {
                    view.addObject(p.labelDiv.update(scope));
                }
                if(p.verticalDropline) {
                    view.addObject(p.verticalDropline.update(scope));
                    p.verticalDropline.createSubObjects(view,scope); // TODO should probably make this more recursive by default
                }
                if(p.horizontalDropline) {
                    view.addObject(p.horizontalDropline.update(scope));
                    p.horizontalDropline.createSubObjects(view,scope); // TODO should probably make this more recursive by default
                }
            }

            return view;
        }

        render(view) {

            var point = this,
                draggable = (point.xDrag || point.yDrag);

            var subview = (view instanceof KG.TwoVerticalGraphs) ? view.topGraph : view;

            if(!point.hasOwnProperty('coordinates')) {
                return view;
            }



            if(isNaN(point.coordinates.x) || isNaN(point.coordinates.y) || point.coordinates.x == Infinity || point.coordinates.y == Infinity) {
                return view;
            }

            var group:D3.Selection = subview.objectGroup(point.name, point.initGroupFn(), true);

            if(!subview.onGraph(point.coordinates)) {
                point.show = false;
            }

            if (point.symbol === 'none') {
                point.show = false;
                point.labelDiv.show = false;
            }

            // draw the symbol at the point
            var pointSymbol:D3.Selection = group.select('.'+ point.viewObjectClass);
            try {
                pointSymbol
                    .attr({
                        'class': point.classAndVisibility(),
                        'fill': point.color,
                        'd': d3.svg.symbol().type(point.symbol).size(point.size),
                        'transform': subview.translateByCoordinates(point.coordinates)
                    });
            } catch(error) {
                console.log(error);
            }

            if(draggable){
                return point.setDragBehavior(subview,pointSymbol);
            } else {
                return view;
            }

            return view;

        }
    }



}