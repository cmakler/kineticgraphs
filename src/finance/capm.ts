/**
 * Created by cmakler on 4/24/15.
 */



module FinanceGraphs.CAPM
{
    export interface IAssetDefinition extends KineticGraphs.IParameterizableDefinition
    {
        mean: number;
        variance: number;
    }

    export interface IAsset extends KineticGraphs.IInteractive
    {
        mean: number;
        variance: number;
        coordinates: () => KineticGraphs.ICoordinates;
    }

    export class Asset extends KineticGraphs.Interactive implements IAsset {

        public mean;
        public variance;

        constructor(definitionString:string) {
            super(definitionString)
        }

        _update() {
            this.mean = this.definition.mean;
            this.variance = this.definition.variance;
        }

        coordinates() {
            return {x: this.variance, y: this.mean}
        }
    }

    //

    export interface IPortfolioDefinition extends KineticGraphs.IParameterizableDefinition
    {
        assets: Asset[];
        covariance: number;
    }

    export interface IPortfolio extends KineticGraphs.IInteractive
    {
        data: () => KineticGraphs.ICoordinates[];
    }

    export class Portfolio extends KineticGraphs.Interactive implements IPortfolio {

        constructor(definitionString:string) {
            super(definitionString)
        }

        data() {
            var asset1 = this.definition.assets[0];
            var asset2 = this.definition.assets[1];
            return [asset1.coordinates(),asset2.coordinates()]
        }
    }
}