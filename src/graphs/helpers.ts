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