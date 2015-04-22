/// <reference path="../graph.ts"/>


module KineticGraphs
{

    export interface IGraphObjectDefinition
    {
        show: boolean;
        className?: string;
        name: string;
    }

    export interface IGraphObjectFactoryDefinition
    {
        type: string;
        definition: IGraphObjectDefinition;
    }

    export interface IGraphObject
    {
        show: boolean;
        className?: string;
        name: string;
        update: (definition:IGraphObjectDefinition) => IGraphObject;
        updateGenerics: (definition:IGraphObjectDefinition) => void;
        render: (graph: IGraph) => IGraph;
    }

    export class GraphObject implements IGraphObject
    {

        public show;
        public className;
        public name;

        constructor() {}

        // Common functionality for all
        updateGenerics(definition) {
            if(!definition.name) {
                console.log('error: a name is required of all objects!')
            }
            this.className = (definition.hasOwnProperty('className')) ? definition.className : '';
            this.show = (definition.hasOwnProperty('show')) ? definition.show : true;
            this.name = definition.name;
        }

        update(definition) {
            return this; // overridden by child class
        }

        render(graph) {
            return graph; // overridden by child class
        }

    }

    export interface IGraphObjects
    {
        reset: (definition: IGraphObjectFactoryDefinition[]) => void;
        update: (definitions: IGraphObjectFactoryDefinition[]) => void;
        render: (graph) => IGraph;
    }

    export class GraphObjects implements IGraphObjects
    {
        private data: IGraphObject[];

        constructor(definitions:IGraphObjectFactoryDefinition[]) {
            this.reset(definitions);
        }

        reset(definitions:IGraphObjectFactoryDefinition[]) {
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