/// <reference path="../eg.ts"/>

'use strict';

module EconGraphs {

    export interface RamseyCassKoopmansDefinition extends KG.ModelDefinition
    {
        alpha: any;
        delta: any;
        rho: any;
        n: any;
        theta: any;
        initialK: any;
        initialC: any;
    }

    export interface IRamseyCassKoopmans extends KG.IModel
    {
        alpha: number;
        delta: number;
        rho: number;
        n: number;
        g: number;
        theta: number;
        initialK: number;
        initialC: number;

        y:(k:number) => number;
        r:(k:number) => number;

        growthPath: KG.ICoordinates[];
        balancedGrowthPath: KGMath.Functions.Base;

        steadyCapital: KGMath.Functions.Polynomial;

        steadyStateK: number;
        steadyStateC: number;

        steadyCapitalView: KG.LinePlot;
        steadyConsumptionView: KG.Line;
        steadyStateView: KG.Point;

        positiveConsumption: boolean;
        steadyStateOnGraph: boolean;

        kdot: (k:number, c:number) => number;
        cdot: (k:number, c:number) => number;

    }

    export class RamseyCassKoopmans extends KG.Model implements IRamseyCassKoopmans
    {
        public alpha;
        public delta;
        public rho;
        public n;
        public theta;
        public g;
        public initialK;
        public initialC;
        public initialPoint;
        public growthPath;
        public growthPathView;
        public balancedGrowthPath;
        public positiveConsumption;
        public steadyStateOnGraph;
        public steadyCapital;
        public steadyStateK;
        public steadyStateC;
        public steadyCapitalView;
        public steadyConsumptionView;
        public steadyStateView;

        constructor(definition:MidpointElasticityDefinition) {
            super(definition);
            this.steadyCapital = new KGMath.Functions.Polynomial({termDefs:[
                {
                    coefficient: 1,
                    powers: ['params.alpha']
                },
                {
                    coefficient: '-(params.delta + params.n + params.g)',
                    powers: [1]
                }
            ]});
            this.steadyCapitalView = new KG.FunctionPlot({
                name: 'steadyCapital',
                fn: 'model.steadyCapital',
                color: 'red',
                numSamplePoints:201
            });
            this.steadyConsumptionView = new KG.Line({
                name: 'steadyConsumption',
                color: 'blue',
                type: 'VerticalLine',
                def: {
                    x: 'model.steadyStateK'
                }
            });
            this.steadyStateView = new KG.Point({
                name: 'steadyStatePoint',
                coordinates: {
                    x: 'model.steadyStateK',
                    y: 'model.steadyStateC'
                },
                symbol: 'cross',
                color: 'grey',
                size: 100,
                label: {
                    text: 'S',
                    align: 'right',
                    valign: 'bottom',
                    color: 'grey'
                }
            });
            this.initialPoint = new KG.Point({
                name: 'initialPoint',
                coordinates: {
                    x: 'params.initialK',
                    y: 'params.initialC'
                },
                className: 'growth',
                size: 500,
                label: {
                    text: 'O'
                },
                xDrag: true,
                yDrag: true
            });
            this.growthPathView = new KG.LinePlot({
                name: 'growthPath',
                data: 'model.growthPath',
                className: 'growth'
            })

        }

        _update(scope) {
            var model = this;

            model.steadyCapital.update(scope);
            model.steadyStateK = Math.pow((model.delta + model.n + model.rho)/model.alpha,(1/(model.alpha - 1)));
            model.steadyStateC = model.steadyCapital.yValue(model.steadyStateK);
            model.growthPath = model.dynamicPath(model.initialK, model.initialC);
            model.positiveConsumption = (model.steadyStateC >= 0);
            model.steadyStateOnGraph = (model.steadyStateK <= 2);

            return model;
        }

        y(k) {
            var model = this;
            return Math.pow(k,model.alpha); // y = f(k) = k^alpha
        }

        r(k) {
            var model = this;
            return model.alpha*Math.pow(k,model.alpha - 1) - model.delta; // interest rate = f'(k) - delta
        }

        kdot(k,c) {
            var model = this;
            return model.y(k) - c - (model.n + model.g + model.delta)*k;
        }

        cdot(k,c) {
            var model = this;
            return (model.r(k) - model.rho)*c/model.theta;
        }

        dynamicPath(k,c) {
            var model = this;

            var points = [{x: k, y: c}];

            var steadyStateAchieved = false,
                zeroConsumption = false,
                zeroCapital = false;

            var iterations = 0;

            while(!steadyStateAchieved && !zeroConsumption && !zeroCapital && iterations < 500) {

                iterations++;
                var kdot = model.kdot(k,c),
                    cdot = model.cdot(k,c);

                // normalize to smooth curve

                var vectorLength = Math.sqrt(kdot*kdot + cdot*cdot),
                    deltaK = 0.005*kdot/vectorLength,
                    deltaC = 0.005*cdot/vectorLength;

                var nextK = k + deltaK,
                    nextC = c + deltaC;

                if(nextK < 0) {
                    zeroCapital = true;
                } else if(nextC < 0) {
                    zeroConsumption = true;
                } else if(KG.isAlmostTo(nextK,model.steadyStateK, 0.05) && KG.isAlmostTo(nextC,model.steadyStateC, 0.05)) {
                    points.push({x:model.steadyStateK, y:model.steadyStateC});
                    steadyStateAchieved = true;
                } else {
                    k = nextK;
                    c = nextC;
                    points.push({x: k, y: c});
                }
            }

            return points;

        }

    }

}