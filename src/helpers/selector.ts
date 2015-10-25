/// <reference path="../kg.ts"/>

'use strict';

module KG {

    export interface SelectorDefinition extends ModelDefinition {
        property: string;
        selected: string;
        options: any;

    }

    export interface ISelector extends IModel {
        property: string;
        selected: string;
        options: any;
        selectedObject: any;
    }

    export class Selector extends Model implements ISelector {

        public property;
        public selected;
        public options;
        public selectedObject;

        constructor(definition:SelectorDefinition, modelPath?:string) {

            super(definition, modelPath);

        }

        _update(scope) {
            var s = this;
            if(s.options.hasOwnProperty(s.selected)) {
                var selectedOption = s.options[s.selected];
                s.selectedObject = createInstance(selectedOption.type, selectedOption.def, s.modelProperty(s.property)).update(scope);
            }

            return s;
        }

    }
}

