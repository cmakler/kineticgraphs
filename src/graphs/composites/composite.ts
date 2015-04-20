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
        update: (definition: any) => IComposite;
        render: (graph:IGraph) => void;
    }

    export class Composite implements IComposite
    {

        constructor() {}

        update(definition:any) {
            return this; // overridden by child class
        }

        render(graph:IGraph) {

        }



    }

}