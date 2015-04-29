/// <reference path="../kg.ts"/>
/// <reference path="../helpers.ts"/>

// numeric lacks a definitions file for now; need to add this to make Typescript happy
declare var numeric: any;

module FinanceGraphs.PortfolioAnalysis
{
    export interface IPortfolioDefinition extends KineticGraphs.IParameterizableDefinition
    {
        assets: Asset[];
        correlations: number[][];
    }

    export interface IPortfolio extends KineticGraphs.IParameterizable
    {
        assets: Asset[];
        data: () => KineticGraphs.ICoordinates[];
        twoAssetPortfolio: (asset1:number,asset2:number,weightArray:any,domain:KineticGraphs.IDomain,dataPoints:number) => any[];
        correlationMatrix: number[][];
        covarianceMatrix: number[][];
        meanArray: number[];
        stdevArray: number[];
        mean: (weightArray:number[]) => number;
        stdev: (weightArray:number[]) => number;
    }

    export class Portfolio extends KineticGraphs.Parameterizable implements IPortfolio {

        public assets;
        public definition:IPortfolioDefinition;
        public correlation:number;
        public correlationMatrix: number[][];
        public covarianceMatrix: number[][];
        public meanArray: number[];
        public stdevArray: number[];

        constructor(definitionString:string) {
            super(definitionString)

        }

        _update() {

            var p = this,
                scope = this.scope;

            p.assets = p.definition.assets;
            p.meanArray = p.assets.map(function(asset) {return KineticGraphs.propertyAsNumber(asset,'mean',scope)});
            p.stdevArray = p.assets.map(function(asset) {return KineticGraphs.propertyAsNumber(asset,'stdev',scope)});

            p.correlationMatrix = [];
            p.covarianceMatrix = [];

            function correlationCoefficient(i,j) {
                if(i==j) {
                    return 1;
                }
                if(scope.params.hasOwnProperty('rho' + i + j)) {
                    return scope.params['rho'+ i + j];
                }
                if(scope.params.hasOwnProperty('rho' + j + i)) {
                    return scope.params['rho'+ j + i];
                }
                console.log('no coefficient specified for ',i,j)
            }

            for(var i=0;i<p.assets.length;i++) {
                var correlationMatrixRow = [];
                for(var j=0;j<p.assets.length;j++) {
                    correlationMatrixRow.push(correlationCoefficient(i,j));
                }
                p.correlationMatrix.push(correlationMatrixRow);
                p.covarianceMatrix.push(correlationMatrixRow.map(function(coeff,j){
                    return coeff*p.stdevArray[i]*p.stdevArray[j];
                }))
            }

        }

        mean(weightArray) {
            return numeric.dot(this.meanArray, weightArray);
        }

        stdev(weightArray) {
            var variance = numeric.dot(weightArray,numeric.dot(this.covarianceMatrix,weightArray));
            if(variance >= 0) {
                return Math.sqrt(variance);
            } else {
                console.log('oops! getting a negative variance with weights ',weightArray[0],',',weightArray[1],',',weightArray[2],'!');
                return 0;
            }

        }

        // Generate dataset of portfolio means and variances for various weights
        data() {
            var portfolio = this, d = [];
            for(var w1=-20; w1<30; w1++) //w1 is weight of asset 1;
            {
                for(var w2=-20; w2<30; w2++) {
                    var w3 = 1-w1*0.1-w2*0.1;
                    var weightArray = [w1*0.1, w2*0.1, w3];
                    var leveraged = (w1 > 0 && w2 > 0 && w3 > 0);
                    d.push({
                        x: portfolio.stdev(weightArray),
                        y: portfolio.mean(weightArray),
                        color: leveraged ? 'red' : 'lightgrey',
                        weights: weightArray
                    })
                }
            }
            return d;
        }

        // Generate lines representing combinations of two assets
        twoAssetPortfolio(asset1,asset2,weightArray,domain,dataPoints) {
            var portfolio = this, d=[], otherAssets = 0;
            weightArray.forEach(function(w) {otherAssets += w});

            var colorScale = d3.scale.linear().domain([0,1]).range(["red","blue"])
            for(var i=0; i<dataPoints + 1; i++) //w1 is weight of asset 1;
            {
                weightArray[asset1] = domain.min + i*(domain.max - domain.min)/dataPoints;
                weightArray[asset2] = 1 - weightArray[asset1];

                d.push({
                    x: portfolio.stdev(weightArray),
                    y: portfolio.mean(weightArray),
                    color: colorScale(weightArray[asset1]),
                    weights: weightArray
                })
            }
            return d;
        }
    }
}