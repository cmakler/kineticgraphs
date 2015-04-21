/// <reference path="../graph.ts"/>

module KineticGraphs
{

    export interface IPrimitiveDefinition
    {
        type: string;
        definition: any;
    }

    export interface IPrimitive
    {
        render: (IGraph) => IGraph;
    }

    export class Primitive implements IPrimitive
    {

        constructor() {}

        render(graph:IGraph) {
            return graph; // overridden by child class
        }

    }

    export interface IPrimitives
    {
        data: IPrimitive[];
        reset: () => void;
        add: (primitive: IPrimitive) => void;
        render: (IGraph) => IGraph;
    }

    export class Primitives implements IPrimitives
    {

        public data;

        constructor() {
            this.reset();
        }

        // clear the list of primitives
        reset() {
            this.data = [];
        }

        // add a primitive to the list of primitives
        add(primitive) {
            this.data.push(primitive);
        }

        // render each primitive to the graph
        render(graph) {
            this.data.forEach(function(primitive) {graph = primitive.render(graph)});
            return graph;
        }
    }

}