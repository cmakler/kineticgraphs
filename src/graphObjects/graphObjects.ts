/// <reference path="../kg.ts"/>


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
        render: (graph: IGraph) => IGraph;
        classAndVisibility: () => string;
    }

    export class GraphObject implements IGraphObject
    {

        public show;
        public className;
        public name;

        constructor() {}

        classAndVisibility() {
            var VISIBLE_CLASS = this.className + ' visible',
                INVISIBLE_CLASS = this.className + ' invisible';

            return this.show ? VISIBLE_CLASS : INVISIBLE_CLASS;
        }

        update(definition) {

            if(!definition.hasOwnProperty('name')) {
                console.log('error: a name is required of all objects!')
            }

            var currentDefinition = this;

            // ensure that the required attributes exist
            currentDefinition.className = (currentDefinition.hasOwnProperty('className')) ? definition.className : '';
            currentDefinition.show = (currentDefinition.hasOwnProperty('show')) ? definition.show : true;
            currentDefinition.name = definition.name;

            // update attributes from (updated) definition, if changed
            for(var key in definition) {
                if(currentDefinition.hasOwnProperty(key) && definition.hasOwnProperty(key) && currentDefinition[key] != definition[key]) {
                    currentDefinition[key] = definition[key];
                }
            }

            return currentDefinition;
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