/// <reference path="../eg.ts"/>

'use strict';

module EconGraphs {

    export interface RamseyCassKoopmansDefinition extends KG.ModelDefinition
    {
        alpha: any;
        delta: any;
        rho: any;
        n: any;
        initialPoint?: KG.ICoordinates;
    }

    export interface IRamseyCassKoopmans extends KG.IModel
    {
        alpha: number;
        delta: number;
        rho: number;
        n: number;
        initialPoint: KG.ICoordinates;
        balancedGrowthPath: KGMath.Functions.Base;

        steadyCapital: KGMath.Functions.Polynomial;

        steadyStateK: number;
        steadyStateC: number;

        steadyCapitalView: KG.LinePlot;
        steadyConsumptionView: KG.Line;
        steadyStateView: KG.Point;

    }

    export class RamseyCassKoopmans extends KG.Model implements IRamseyCassKoopmans
    {
        public alpha;
        public delta;
        public rho;
        public n;
        public initialPoint;
        public balancedGrowthPath;
        public steadyCapital;
        public steadyStateK;
        public steadyStateC;
        public steadyCapitalView;
        public steadyConsumptionView;
        public steadyStateView;

        constructor(definition:MidpointElasticityDefinition) {
            super(definition);
            this.steadyCapital = new KGMath.Functions.Polynomial({terms:[
                {
                    type: 'KGMath.Functions.Monomial',
                    definition: {
                        coefficient: 1,
                        powers: ['params.alpha']
                    }
                },
                {
                    type: 'KGMath.Functions.Monomial',
                    definition: {
                        coefficient: '-(params.delta + params.n)',
                        powers: [0]
                    }
                }
            ]});
            this.steadyCapitalView = new KG.FunctionPlot({
                name: 'steadyCapital',
                fn: 'model.steadyCapital',
                color: 'red'
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
                name: 'midpoint',
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
        }

        _update(scope) {
            var model = this;

            model.steadyCapital.update(scope);
            model.steadyStateK = Math.pow(model.delta + model.n + model.rho,(1/model.alpha));
            model.steadyStateC = model.steadyCapital.yValue(model.steadyStateK);

            return model;
        }

    }

}