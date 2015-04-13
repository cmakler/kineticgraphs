/**
 * Created by cmakler on 4/7/15.
 */

module KineticGraphs
{
    export interface IRange
    {
        min: number;
        max: number;
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