/// <reference path="../kg.ts"/>

'use strict';

module KG {

    export interface SelectorOptionDefinition {
        name: string;
        label: string;
        selection: {type: string; definition: ModelDefinition}
    }

    export interface SelectorDefinition extends ModelDefinition {
        selected: string;
        options: SelectorOptionDefinition[];
    }

    export interface ISelector extends IModel {
        definition: SelectorDefinition;
        selected: string;
        options: SelectorOptionDefinition[];
        selectedObjectDef: {type: string; definition: ModelDefinition};
        selectedObject: Model;
        getObjectByName: (name: string) => {type: string; def: ModelDefinition};
        selectOption: (name: string) => void;

    }

    export class Selector extends Model implements ISelector {

        public definition;
        public property;
        public selected;
        public options;
        public selectedObjectDef;
        public selectedObject;

        constructor(definition:SelectorDefinition, modelPath?:string) {
            super(definition, modelPath);
        }

        getObjectByName(name) {
            var s = this;
            var foundObject = getArrayObjectByProperty(s.definition.options,name);
            if(foundObject) {
                return foundObject.selection;
            } else {
                return null;
            }
        }

        selectOption(name) {
            var s = this;
            var selectedObject = s.getObjectByName(name);
            if(selectedObject) {
                s.selectedObjectDef = selectedObject;
            }
        }

        _update(scope) {
            var s = this;
            if(s.selected) {
                s.selectOption(s.selected);
            }
            s.selectedObject = createInstance(s.selectedObjectDef, s.modelPath).update(scope);
            s.selectedObject.selector = s;
            return s.selectedObject;
        }

    }
}

