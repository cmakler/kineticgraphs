/// <reference path="../kg.ts"/>

'use strict';

module KG
{

    export interface ViewObjectDefinition extends ModelDefinition
    {
        name?: string;
        show?: boolean;
        className?: string;
        xDrag?: boolean;
        yDrag?: boolean;
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
        createSubObjects: (view: View) => View;

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
            definition = _.defaults(definition, {className: '', show: true, xDrag: false, yDrag: false});
            super(definition);
            this.xDragDelta = 0;
            this.yDragDelta = 0;
            this.xDragParam = definition.xDrag ? definition.coordinates.x.replace('params.','') : null;
            this.yDragParam = definition.yDrag ? definition.coordinates.y.replace('params.','') : null;
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