/// <reference path="../kg.ts"/>

'use strict';

module KineticGraphs
{

    export interface ViewObjectDefinition extends ModelDefinition
    {
        name: string;
        show?: boolean;
        className?: string;
        xDragParam?: string;
        yDragParam?: string;
    }

    export interface IViewObject extends IModel
    {
        show: boolean;
        className?: string;
        name: string;
        render: (view: View) => View;
        createSubObjects: (view: View) => View;
        classAndVisibility: () => string;
        xDragDelta: number;
        yDragDelta: number;

        initGroupFn: (svgType:string, className: string) => any;
        setDragBehavior: (view: View, obj: D3.Selection) => View;
    }

    export class ViewObject extends Model implements IViewObject
    {

        public show;
        public className;
        public name;
        public xDragParam;
        public yDragParam;
        public xDragDelta;
        public yDragDelta;
        public viewObjectSVGtype;
        public viewObjectClass;

        constructor(definition:ViewObjectDefinition) {
            definition = _.defaults(definition, {className: '', show: true});
            super(definition);
            this.xDragDelta = 0;
            this.yDragDelta = 0;
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
            if(!viewObj.hasOwnProperty('xDragParam')) {
                // allow vertical dragging only
                obj.style('cursor','ns-resize');
                obj.call(view.drag(null, viewObj.yDragParam, 0, viewObj.yDragDelta));
            } else if(!viewObj.hasOwnProperty('yDragParam')){
                // allow horizontal dragging only
                obj.style('cursor','ew-resize');
                obj.call(view.drag(viewObj.xDragParam, null, viewObj.xDragDelta, 0));
            } else {
                // allow bidirectional dragging
                obj.style('cursor','move');
                obj.call(view.drag(viewObj.xDragParam, viewObj.yDragParam, viewObj.xDragDelta, viewObj.yDragDelta));
            }
            return view;
        }

    }



}