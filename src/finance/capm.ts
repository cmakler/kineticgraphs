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
            var scope = this.scope;

            function dataPoints(a,b) {
                var dataset = [];
                var mean, variance;

                function propertyAsNumber(o,p,scope) {
                    var v;
                    if(o.hasOwnProperty(p)){
                        if(typeof o[p] == 'string') {
                            v = scope.$eval('params.' + o[p]);
                        } else {
                            v = o[p];
                        }
                    }
                    return v;
                }

                function convexCombination(a,b,percent) {
                    return (percent*a + (100-percent)*b)/100;
                }

                var mean1 = propertyAsNumber(asset1,'mean',scope),
                    variance1 = propertyAsNumber(asset1,'variance',scope),
                    mean2 = propertyAsNumber(asset2,'mean',scope),
                    variance2 = propertyAsNumber(asset2,'variance',scope);

                for(var i=1; i<10; i++) {
                    mean = convexCombination(mean1, mean2, i*10);
                    variance = convexCombination(variance1, variance2, i*10);
                    dataset.push({x: variance, y: mean});
                }
                return dataset;
            }
            return dataPoints(asset1,asset2);
        }
    }
}