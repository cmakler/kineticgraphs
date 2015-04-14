/// <reference path="../kg.ts"/>

module KineticGraphs
{

    // rendered objects are the primitives that are rendered on the screen
    export interface IPrimitives {
        PRIMITIVE_TYPES: string[];
        areas: D3.Selection[];
        rects: D3.Selection[];
        curves: D3.Selection[];
        lines: D3.Selection[];
        circles: D3.Selection[];

    }

    export class Primitives implements IPrimitives {

        public areas;
        public rects;
        public curves;
        public lines;
        public circles;

        constructor() {}

        PRIMITIVE_TYPES = ['area','rect','curve','line','circle'];



    }

    export interface IPrimitive
    {
        render: (any) => D3.Selection;
    }

    export class Primitive implements IPrimitive {

        constructor() {}

        render(vis) {
            return vis;
        }
    }

}