/// <reference path="../../eg.ts"/>

'use strict';

module EconGraphs {

    export interface ConstantElasticityDefinition extends ElasticityDefinition
    {
        elasticity?: any;
    }

    export interface IConstantElasticity extends IElasticity
    {

    }

    export class ConstantElasticity extends Elasticity implements IConstantElasticity
    {
        constructor(definition:ConstantElasticityDefinition, modelPath?:string) {
            super(definition, modelPath);
        }

    }

}