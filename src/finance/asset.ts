/**
 * Created by cmakler on 4/27/15.
 */

/**
 * Created by cmakler on 4/24/15.
 */

// numeric lacks a definitions file for now; need to add this to make Typescript happy
declare var numeric: any;

module FinanceGraphs.PortfolioAnalysis
{
    export interface IAssetDefinition extends KineticGraphs.IParameterizableDefinition
    {
        mean: number;
        stdev: number;
    }

    export interface IAsset extends KineticGraphs.IParameterizable
    {
        mean: number;
        stdev: number;
        coordinates: () => KineticGraphs.ICoordinates;
    }

    export class Asset extends KineticGraphs.Interactive implements IAsset {

        public mean;
        public stdev;

        constructor(definitionString:string) {
            super(definitionString)
        }

        _update() {
            this.mean = this.definition.mean;
            this.stdev = this.definition.stdev;
        }

        coordinates() {
            return {x: this.stdev, y: this.mean}
        }
    }
}