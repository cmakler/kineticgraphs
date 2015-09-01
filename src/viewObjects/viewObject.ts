/// <reference path="../kg.ts"/>

'use strict';

module KG
{

    export interface ViewObjectDefinition extends ModelDefinition
    {
        name?: string;
        show?: boolean;
        className?: string;
        xDrag?: any;
        yDrag?: any;
        color?: string;
        coordinates?: ICoordinates;
    }

    export interface IViewObject extends IModel
    {
        // identifiers
        name: string;
        className?: string;
        color: string;

        show: boolean;
        classAndVisibility: () => string;

        // Creation and rendering
        initGroupFn: (svgType:string, className: string) => any;
        render: (view: View) => View;
        addArrow: (group:D3.Selection, startOrEnd: string) => void;
        removeArrow: (group:D3.Selection, startOrEnd: string) => void;
        createSubObjects: (view: View) => View;

        // Updating
        updateDataForView: (view: View) => ViewObject

        // Dragging behavior
        coordinates: ICoordinates;
        xDrag:boolean;
        yDrag:boolean;
        xDragParam: string;
        yDragParam: string;
        xDragDelta: number;
        yDragDelta: number;
        setDragBehavior: (view: View, obj: D3.Selection) => View;
    }

    export class ViewObject extends Model implements IViewObject
    {

        public show;
        public className;
        public color;
        public name;
        public coordinates;
        public xDrag;
        public yDrag;
        public xDragParam;
        public yDragParam;
        public xDragDelta;
        public yDragDelta;
        public viewObjectSVGtype;
        public viewObjectClass;

        constructor(definition:ViewObjectDefinition) {

            definition = _.defaults(definition, {
                className: '',
                color: KG.colorForClassName(definition.className),
                show: true,
                xDrag: false,
                yDrag: false});

            super(definition);

            var viewObj = this;
            viewObj.xDragDelta = 0;
            viewObj.yDragDelta = 0;

            if(definition.xDrag) {
                if(typeof definition.xDrag == 'string') {
                    viewObj.xDragParam = definition.xDrag.replace('params.','');
                    viewObj.xDrag = true;
                } else if(definition.hasOwnProperty('coordinates') && typeof definition.coordinates.x == 'string') {
                    this.xDragParam = definition.coordinates.x.replace('params.','');
                }
            }

            if(definition.yDrag) {
                if(typeof definition.yDrag == 'string') {
                    viewObj.yDragParam = definition.yDrag.replace('params.','');
                    viewObj.yDrag = true;
                } else if(definition.hasOwnProperty('coordinates') && typeof definition.coordinates.y == 'string') {
                    this.yDragParam = definition.coordinates.y.replace('params.','');
                }
            }
        }

        classAndVisibility() {
            var classString = this.viewObjectClass;
            if(this.className) {
                classString += ' ' + this.className;
            }
            if(this.show) {
                classString += ' visible';
            } else {
                classString += ' invisible';
            }
            return classString;
        }

        updateDataForView(view) {
            return this;
        }

        addArrow(group: D3.Selection, startOrEnd: string) {
            group.attr("marker-" + startOrEnd, "url(#arrow-" + startOrEnd + "-" + this.color + ")")
        }

        removeArrow(group: D3.Selection, startOrEnd: string) {
            group.attr("marker-" + startOrEnd, null);
        }

        render(view) {
            return view; // overridden by child class
        }

        createSubObjects(view) {
            return view; // overridden by child class
        }

        initGroupFn() {
            var viewObjectSVGtype = this.viewObjectSVGtype,
                viewObjectClass = this.viewObjectClass;
            return function(newGroup:D3.Selection) {
                newGroup.append(viewObjectSVGtype).attr('class', viewObjectClass);
                return newGroup;
            }
        }

        setDragBehavior(view, obj) {
            var viewObj = this;
            obj.style('cursor', viewObj.xDrag ? (viewObj.yDrag ? 'move' : 'ew-resize') : 'ns-resize');
            obj.call(view.drag(viewObj.xDragParam, viewObj.yDragParam, viewObj.xDragDelta, viewObj.yDragDelta));
            return view;
        }

    }



}