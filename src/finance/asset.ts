'use strict';

// numeric lacks a definitions file for now; need to add this to make Typescript happy
declare var numeric: any;

module FinanceGraphs.PortfolioAnalysis
{
    export interface AssetDefinition
    {
        mean: number;
        stdev: number;
    }

    export interface IAsset
    {
        mean: number;
        stdev: number;
        coordinates: () => KineticGraphs.ICoordinates;
    }

    export class Asset extends KineticGraphs.View implements IAsset {

        public mean;
        public stdev;

        constructor(definition:AssetDefinition) {
            super(definition)
        }

        coordinates() {
            return {x: this.stdev, y: this.mean}
        }
    }
}