/// <reference path="../kg.ts"/>
/// <reference path="slider.ts"/>

module KineticGraphs
{
    export interface IControlDefinition
    {
        type: number;
        param: string;
    }

    export interface IControl
    {
        scope: IModelScope;
        controlDefinition: IControlDefinition
    }

    export class Control implements IControl
    {
        constructor(public scope, public controlDefinition) {}
    }

}