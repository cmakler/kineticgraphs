/// <reference path="../graph.ts"/>
/// <reference path="point.ts"/>

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
        addPrimitives: (primitives:IPrimitives) => IPrimitives;
    }

    export class Composite implements IComposite
    {

        constructor() {}

        update(definition) {
            return this; // overridden by child class
        }

        addPrimitives(primitives) {
            return primitives; // overridden by child class
        }

    }

    export interface IComposites
    {
        reset: () => void;
        update: (definitions: ICompositeDefinition[]) => void;
        getPrimitives: () => IPrimitives;
    }

    export class Composites implements IComposites
    {
        private data: IComposite[];

        constructor(definitions:ICompositeDefinition[]) {
            this.reset();
            this.update(definitions);
        }

        reset() {
            this.data = [];
        }

        update(definitions) {
            this.data.forEach(function(composite,index) {
                composite.update(definitions[index].definition)
            });
        }

        getPrimitives() {
            var primitives = new Primitives();
            this.data.forEach(function(composite) {
                primitives = composite.addPrimitives(primitives);
            });
            return primitives;
        }
    }



}