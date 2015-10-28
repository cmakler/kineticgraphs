/// <reference path="../../../eg.ts"/>

module EconGraphs {

    export interface UtilityConstraintDefinition extends KG.ModelDefinition {
        u: any;
        px?: any;
        py?: any;
    }

    export interface IUtilityConstraint extends KG.IModel {
        u: number;
        px?: number;
        py?: number;
    }

    export class UtilityConstraint extends KG.Model implements IUtilityConstraint {

        public u;
        public px;
        public py;

        constructor(definition:UtilityConstraintDefinition, modelPath?:string) {
            super(definition, modelPath);
        }
    }
}