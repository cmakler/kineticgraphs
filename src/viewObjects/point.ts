/// <reference path="../kg.ts"/>

'use strict';

module KG
{

    export interface PointDefinition extends ViewObjectDefinition {
        symbol?: string;
        size?: number;
        label?: GraphDivDefinition;
        droplines?: any;
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

        constructor(definition:PointDefinition) {

            var defaultSize = 100;
            if(definition.hasOwnProperty('label')) {
                if(definition.label.hasOwnProperty('text')) {
                    if(definition.label.text.length > 0) {
                        defaultSize = 500;
                    }
                }
            }

            definition = _.defaults(definition, {coordinates: {x:0,y:0}, size: defaultSize, symbol: 'circle'});
            super(definition);

            if(definition.label) {
                var labelDef = _.defaults(definition.label, {
                    name: definition.name + '_label',
                    coordinates:definition.coordinates,
                    xDrag: definition.xDrag,
                    yDrag: definition.yDrag
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
                    });
                }
                if(definition.droplines.hasOwnProperty('vertical')) {
                    this.verticalDropline = new VerticalDropline({
                        name: definition.name,
                        coordinates: definition.coordinates,
                        draggable: definition.xDrag,
                        axisLabel: definition.droplines.vertical,
                        className: definition.className,
                    });
                }
            }

            this.viewObjectSVGtype = 'path';
            this.viewObjectClass = 'pointSymbol';
        }

        createSubObjects(view) {
            var p = this;
            if(view instanceof KG.TwoVerticalGraphs) {
                if(p.labelDiv) {
                    view.topGraph.addObject(p.labelDiv);
                }
                if(p.verticalDropline) {
                    var continuationDropLine = new VerticalDropline({
                        name: p.verticalDropline.name,
                        coordinates: {x: p.verticalDropline.definition.coordinates.x, y: view.bottomGraph.yAxis.domain.max},
                        draggable: p.verticalDropline.draggable,
                        axisLabel: p.verticalDropline.axisLabel
                    });
                    p.verticalDropline.labelDiv = null;
                    view.topGraph.addObject(p.verticalDropline);
                    view.bottomGraph.addObject(continuationDropLine);
                    p.verticalDropline.createSubObjects(view.topGraph); // TODO should probably make this more recursive by default
                    continuationDropLine.createSubObjects(view.bottomGraph);
                }
                if(p.horizontalDropline) {
                    view.topGraph.addObject(p.horizontalDropline);
                    p.horizontalDropline.createSubObjects(view.topGraph); // TODO should probably make this more recursive by default
                }
            } else {
                if(p.labelDiv) {
                    view.addObject(p.labelDiv);
                }
                if(p.verticalDropline) {
                    view.addObject(p.verticalDropline);
                    p.verticalDropline.createSubObjects(view); // TODO should probably make this more recursive by default
                }
                if(p.horizontalDropline) {
                    view.addObject(p.horizontalDropline);
                    p.horizontalDropline.createSubObjects(view); // TODO should probably make this more recursive by default
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