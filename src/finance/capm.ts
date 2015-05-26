'use strict';

// numeric lacks a definitions file for now; need to add this to make Typescript happy
declare var numeric: any;

module FinanceGraphs.CAPM
{
    export interface PortfolioDefinition
    {
        assets: Asset[];
        correlation: number;
    }

    export interface IPortfolio extends KineticGraphs.IView
    {
        data: () => KineticGraphs.ICoordinates[];
        assets: Asset[];
        mean: (weightArray:number[]) => number;
        variance: (weightArray:number[]) => number;
    }

    export class Portfolio extends KineticGraphs.View implements IPortfolio {

        public assets;
        public correlation:number;

        constructor(definitionString:string) {
            super(definitionString)
        }

        _update() {
            this.assets = this.definition.assets;
            this.correlation = this.scope.params.correlation; //temporary placeholder for just 2 assets
        }

        mean(weightArray) {
            var scope = this.scope;
            var meanArray = this.assets.map(function(asset) {return KineticGraphs.propertyAsNumber(asset,'mean',scope)});
            return numeric.dot(meanArray,weightArray);
        }

        variance(weightArray) {

            // Helper function mapping an array onto a diagonal matrix of array values;
            // used to generate variance matrix from array of variances
            function diagonalMatrix(a:number[]) {
                var M:number[][] = [];
                for(var i=0; i<a.length; i++) {
                    M.push(a.map(function(n,j){
                        return (i == j) ? n : 0
                    }))
                }
                return M;
            }

            var scope = this.scope;
            var varianceArray = this.assets.map(function(asset) {return KineticGraphs.propertyAsNumber(asset,'variance',scope)});
            var varianceMatrix = diagonalMatrix(varianceArray);

            var correlationMatrix = [[1,this.correlation],[this.correlation,1]]; //temporary placeholder for just 2 assets

            var covarianceMatrix = numeric.dot(correlationMatrix,varianceMatrix);
            return numeric.dot(weightArray,numeric.dot(covarianceMatrix,weightArray));
        }

        // Generate dataset of portfolio means and variances for various weights
        data() {
            var portfolio = this, d = [];
            for(var w=0.1; w<1; w+=0.1) //w is weight of asset 1; weight of asset 2 is 1-w
            {
                d.push({
                    x: portfolio.variance([w,1-w]),
                    y: portfolio.mean([w, 1-w])});
            }
            return d;
        }
    }
}