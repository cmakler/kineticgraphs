/// <reference path="../graph.ts"/>


module KineticGraphs
{

    export interface IGraphObjectDefinition
    {
        type: string;
        definition: any;
    }

    export interface IGraphObject
    {
        update: (definition: any) => IGraphObject;
        render: (graph: IGraph) => IGraph;
    }

    export class GraphObject implements IGraphObject
    {

        constructor() {}

        update(definition) {
            return this; // overridden by child class
        }

        render(graph) {
            return graph; // overridden by child class
        }

    }

    export interface IGraphObjects
    {
        reset: (definition: IGraphObjectDefinition[]) => void;
        update: (definitions: IGraphObjectDefinition[]) => void;
        render: (graph) => IGraph;
    }

    export class GraphObjects implements IGraphObjects
    {
        private data: IGraphObject[];

        constructor(definitions:IGraphObjectDefinition[]) {
            this.reset(definitions);
        }

        reset(definitions:IGraphObjectDefinition[]) {
            this.data = definitions.map(function(definition) { return new KineticGraphs[definition.type]});
        }

        // Updates all graphObjects based on an array of definitions, and returns updated GraphObjects object
        update(definitions) {
            this.data.forEach(function(graphObject,index) {
                graphObject.update(definitions[index].definition)
            });
            return this;
        }

        render(graph) {
            this.data.forEach(function(graphObject) {
                graph = graphObject.render(graph);
            });
            return graph;
        }
    }



}