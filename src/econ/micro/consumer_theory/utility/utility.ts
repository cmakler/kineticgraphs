/// <reference path="../../../eg.ts"/>

module EconGraphs {

    export interface UtilityDefinition extends KG.ModelDefinition
    {
        type?: string;
        def?: KGMath.Functions.BaseDefinition;
        className?: string;
        curveLabel?: string;
    }

    export interface IUtility extends KG.IModel
    {
        utilityFunction: KGMath.Functions.Base;
    }

    export class Utility extends KG.Model implements IUtility
    {

        public className;
        public utilityFunction;
        public utilityFunctionView;

        constructor(definition:UtilityDefinition, modelPath?:string) {

            definition = _.defaults(definition,{
                className: 'utility'
            });
            super(definition, modelPath);

            this.utilityFunction = new KGMath.Functions[definition.type](definition.def);

        }

        _update(scope) {
            var u = this;
            u.utilityFunction.update(scope);
            return u;
        }

    }

}