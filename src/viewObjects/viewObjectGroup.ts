/// <reference path="../kg.ts"/>

'use strict';

module KG {

    export interface ViewObjectGroupDefinition extends ViewObjectDefinition {
        viewObjects: ViewObject[];
    }

    export interface IViewObjectGroup extends IViewObject {

        viewObjects: ViewObject[];
    }

    export class ViewObjectGroup extends ViewObject implements IViewObjectGroup {

        public viewObjects;

        constructor(definition:ViewObjectGroupDefinition, modelPath?: string) {
            super(definition, modelPath);
            this.viewObjects = definition.viewObjects;
        }

        createSubObjects(view,scope) {
            this.viewObjects.forEach(function(viewObject){
                view.addObject(viewObject.update(scope));
                viewObject.createSubObjects(view,scope);
            });
            return view;
        }

        initGroupFn() {
            var g = this;
            return function(newGroup:D3.Selection) {
                g.viewObjects.forEach(function(obj){
                    newGroup.append(obj.viewObjectSVGtype).attr('class', obj.viewObjectClass + ' ' + obj.objectName)
                });
                return newGroup;
            }
        }

        render(view) {
            var g = this;

            var group:D3.Selection = view.objectGroup(g.name, g.initGroupFn(), false);

            return view;

        }

    }

}