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
    export interface IPortfolioDefinition extends KineticGraphs.IParameterizableDefinition
    {
        assets: Asset[];
        correlations: number[][];
    }

    export interface IPortfolio extends KineticGraphs.IParameterizable
    {
        assets: Asset[];
        data: () => KineticGraphs.ICoordinates[];
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
            for(var w1=0; w1<20; w1++) //w1 is weight of asset 1;
            {
                for(var w2=0; w2<21-w1; w2++) {
                    var weightArray = [w1*0.05, w2*0.05, 1-w1*0.05-w2*0.05];

                    d.push({
                        x: portfolio.stdev(weightArray),
                        y: portfolio.mean(weightArray),
                        color: (w1 == 0 || w2 == 0 || w1 + w2 == 20) ? 'red' : 'blue',
                        weights: weightArray
                    })
                }
            }
            return d;
        }
    }
}