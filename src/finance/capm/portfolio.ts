/// <reference path="../fg.ts"/>

'use strict';

// numeric lacks a definitions file for now; need to add this to make Typescript happy
declare var numeric: any;

module FinanceGraphs
{
    export interface PortfolioDefinition extends KG.ModelDefinition
    {
        asset1: any;
        asset2: any;
        asset3: any;
        rho12: number;
        rho23: number;
        rho13: number;
        maxLeverage: number;
    }

    export interface IPortfolio extends KG.IModel
    {
        asset1: Asset;
        asset2: Asset;
        asset3: Asset;
        data: () => any[][];
        twoAssetPortfolio: (asset1:number,asset2:number,weightArray:any,domain:KG.IDomain,dataPoints:number) => any[];
        correlationMatrix: () => number[][];
        covarianceMatrix: () => number[][];
        meanArray: () => number[];
        stDevArray: () =>number[];
        mean: (weightArray:number[]) => number;
        stDev: (weightArray:number[]) => number;
        twoPortfolios: () => KG.PathFamily;
    }

    export class Portfolio extends KG.Model implements IPortfolio {

        public asset1;
        public asset2;
        public asset3;
        private assets;
        private maxLeverage;
        private two;

        constructor(definition:PortfolioDefinition) {
            ['rho12','rho13','rho23','maxLeverage'].forEach(function(name){definition[name] = 'params.' + name;});
            definition.asset1 = {
                type: 'FinanceGraphs.Asset',
                definition: {
                    name: 'A_1',
                    mean: 'params.mean1',
                    stDev: 'params.stDev1'
                }
            };
            definition.asset2 = {
                type: 'FinanceGraphs.Asset',
                definition: {
                    name: 'A_2',
                    mean: 'params.mean2',
                    stDev: 'params.stDev2'
                }
            };
            definition.asset3 = {
                type: 'FinanceGraphs.Asset',
                definition: {
                    name: 'A_3',
                    mean: 'params.mean3',
                    stDev: 'params.stDev3'
                }
            }
            super(definition);
            var p = this;
            p.assets = [p.asset1, p.asset2, p.asset3];
            p.two = new KG.PathFamily({
                name: 'portfolioData',
                data: 'model.data()',
                interpolation: 'basis'
            })
        }

        correlationMatrix() {

            var p = this;
            var matrix = [];

            function correlation(i,j) {
                if(i==j) {
                    return 1;
                } else if(i>j){
                    return correlation(j,i)
                } else {
                    return p['rho' + (i + 1) + (j + 1)]
                }
            }

            for(var i=0;i<p.assets.length;i++) {
                var correlationMatrixRow = [];
                for(var j=0;j<p.assets.length;j++) {
                    correlationMatrixRow.push(correlation(i,j));
                }
                matrix.push(correlationMatrixRow);
            }

            return matrix;
        }

        covarianceMatrix() {

            var correlationMatrix = this.correlationMatrix();
            var stDevArray = this.stDevArray();
            return correlationMatrix.map(function(correlationMatrixRow, i) {
                return correlationMatrixRow.map(function(correlationMatrixCell,j){
                    return correlationMatrixCell*stDevArray[i]*stDevArray[j];
                })
            });

        }

        meanArray() {
            return this.assets.map(function(asset) {return asset.mean});
        }

        stDevArray() {
            return this.assets.map(function(asset) {return asset.stDev});
        }

        mean(weightArray) {
            return numeric.dot(this.meanArray(), weightArray);
        }

        stDev(weightArray) {
            var variance = numeric.dot(weightArray,numeric.dot(this.covarianceMatrix(),weightArray));
            if(variance >= 0) {
                return Math.sqrt(variance);
            } else {
                console.log('oops! getting a negative variance with weights ',weightArray[0],',',weightArray[1],',',weightArray[2],'!');
                return 0;
            }
        }

        // Generate dataset of portfolio means and variances for various weights
        data() {
            var portfolio = this, maxLeverage = portfolio.maxLeverage, d = [], w;
            var min = -maxLeverage*0.01, max = 1 + maxLeverage*0.01, dataPoints = 2*(10 + maxLeverage*0.2);
            for(var i=0; i<dataPoints + 1; i++) //w1 is weight of asset 1;
            {
                w = min + i*(max - min)/dataPoints;
                d.push(portfolio.twoAssetPortfolio(1,2,[w,0,0]));
                d.push(portfolio.twoAssetPortfolio(0,2,[0,w,0]));
                d.push(portfolio.twoAssetPortfolio(0,1,[0,0,w]));
            }
            return d;
        }

        // Generate lines representing combinations of two assets
        twoAssetPortfolio(asset1,asset2,weightArray) {
            var portfolio = this, maxLeverage = portfolio.maxLeverage, d=[], otherAssets = 0;
            weightArray.forEach(function(w) {otherAssets += w});
            var min = -maxLeverage*0.01, max = 1 + maxLeverage*0.01, dataPoints = 2*(10 + maxLeverage*0.2);
            var colorScale = d3.scale.linear().domain([0,1]).range(["red","blue"])
            for(var i=0; i<dataPoints + 1; i++) //w1 is weight of asset 1;
            {
                weightArray[asset1] = min + i*(max - min)/dataPoints;
                weightArray[asset2] = 1 - weightArray[asset1] - otherAssets;
                if(weightArray[asset2] >= min) {
                    d.push({
                        x: portfolio.stDev(weightArray),
                        y: portfolio.mean(weightArray),
                        color: colorScale(weightArray[asset1]),
                        weights: weightArray
                    })
                }
            }
            return d;
        }

        twoPortfolios() {
            var p = this;
            p.two.data = p.data();
            return p.two;
        }
    }
}