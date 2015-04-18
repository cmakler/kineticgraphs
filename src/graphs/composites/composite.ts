/// <reference path="../graph.ts"/>

module KineticGraphs
{

    export interface ICompositeDefinition
    {
        type: string;
        definition: any;
    }

    export interface IComposite
    {
        render: (definition: any) => void;
    }

    export interface ICompositeFactory
    {
        type: string;
        instance: (definition: any, graph:IGraph) => IComposite;
    }

    export class Composite implements ICompositeFactory
    {
        constructor(public type: string) {}

        instance = function(definition, graph) {
            return new KineticGraphs[this.type](definition,graph);
        }
    }

}