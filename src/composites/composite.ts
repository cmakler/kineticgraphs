/// <reference path="../kg.ts"/>
/// <reference path="point.ts"/>

module KineticGraphs
{

    // base interface for all composite objects
    // (they should all be able to render themselves as a set of primitives)
    export interface IComposite
    {
        render: (graph:IGraphScope)=> IGraphScope
    }

    // base interface for all composite object scopes
    export interface ICompositeScope extends ng.IScope
    {

    }


}