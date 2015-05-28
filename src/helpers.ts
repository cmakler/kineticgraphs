/// <reference path="kg.ts"/>

'use strict';

module KG
{
    export interface IDomain
    {
        min: number;
        max: number;
        toArray: () => number[];
        contains: (x:number) => boolean;
    }

    export class Domain implements IDomain
    {

        constructor(public min: number, public max: number) {
            this.min = this.min || 0;
            this.max = this.max || 10;
        }

        toArray() {
            return [this.min, this.max]
        }

        contains(x) {
            var lowEnough:boolean = (this.max >= x);
            var highEnough:boolean = (this.min <= x);
            return lowEnough && highEnough;
        }

    }

    export interface IDimensions
    {
        height: number;
        width: number;
    }

    export interface IMargins
    {
        left: number;
        top: number;
        right: number;
        bottom: number;
    }

    export interface ICoordinates
    {
        x: any;
        y: any;
    }

    export function translateByPixelCoordinates(coordinates:ICoordinates) {
        return 'translate(' + coordinates.x + ',' + coordinates.y + ')'
    }

    export function positionByPixelCoordinates(coordinates:ICoordinates, dimension?:IDimensions) {
        var style = 'position:relative; left: ' + coordinates.x + 'px; top: ' + coordinates.y + 'px;';
        if(dimension) {
            if(dimension.hasOwnProperty('width')) {
                style += ' width: ' + dimension.width + 'px;'
            }
        }
        return style;
    }

    export function getCoordinates(def) {
        var defaultCoordinates:{} = {x: 0, y: 0};
        if(!def || def == undefined) {
            return defaultCoordinates;
        }
        if(def.hasOwnProperty('coordinates')){
            return def.coordinates;
        } else if(def.hasOwnProperty('x') && def.hasOwnProperty('y')){
            return def;
        } else if(def.hasOwnProperty('definition')) {
            return getCoordinates(def.definition)
        } else {
            return defaultCoordinates;
        }
    }

    export function createInstance(definition) {

        // from http://stackoverflow.com/questions/1366127/
        function typeSpecificConstructor(typeName) {
            var arr = typeName.split(".");

            var fn = (window || this);
            for (var i = 0, len = arr.length; i < len; i++) {
                fn = fn[arr[i]];
            }

            if (typeof fn !== "function") {
                throw new Error("object type " + typeName + " not found");
            }

            return fn;
        }

        // each object is a new instance of the class named in the 'type' parameter
        var newObjectConstructor = typeSpecificConstructor(definition.type);
        return new newObjectConstructor(definition.definition);

    }

}