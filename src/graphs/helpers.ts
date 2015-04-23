/**
 * Created by cmakler on 4/7/15.
 */

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

}