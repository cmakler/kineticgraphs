/// <reference path="kg.ts"/>

module KineticGraphs
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
        x: number;
        y: number;
    }

    export function propertyAsNumber(o,p,scope) {
        var v;
        if(o.hasOwnProperty(p)){
            if(typeof o[p] == 'string') {
                v = scope.$eval('params.' + o[p]);
            } else {
                v = o[p];
            }
        }
        return v;
    }

    export function translateByPixelCoordinates(coordinates:ICoordinates) {
        return 'translate(' + coordinates.x + ',' + coordinates.y + ')'
    }

    export function positionByPixelCoordinates(coordinates:ICoordinates, dimension?:IDimensions) {
        var style = 'position:absolute; left: ' + coordinates.x + 'px; top: ' + coordinates.y + 'px;';
        if(dimension) {
            if(dimension.hasOwnProperty('width')) {
                style += ' width: ' + dimension.width + 'px;'
            }
        }
        return style;
    }

}