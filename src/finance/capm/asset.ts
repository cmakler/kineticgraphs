/// <reference path="../fg.ts"/>

'use strict';

// numeric lacks a definitions file for now; need to add this to make Typescript happy
declare var numeric: any;

module FinanceGraphs
{
    export interface AssetDefinition extends KG.ModelDefinition
    {
        name: string;
        mean: any;
        stDev: any;
    }

    export interface IAsset extends KG.IModel
    {
        mean: number;
        stDev: number;
        point: KG.Point;
    }

    export class Asset extends KG.Model implements IAsset {

        public mean;
        public stDev;
        public point;

        constructor(definition:AssetDefinition) {
            super(definition)
            this.point = new KG.Point({
                name: definition.name+'point',
                coordinates: {x: definition.stDev, y:definition.mean},
                size: 500,
                xDrag: true,
                yDrag: true,
                label: definition.name
            })
        }
    }
}