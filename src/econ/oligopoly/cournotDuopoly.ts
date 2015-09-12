/// <reference path="../eg.ts"/>

module EconGraphs {

    export interface CournotDuopolyDefinition extends KG.ModelDefinition
    {
        marketDemandIntercept: any;
        marketDemandSlope: any;
        q1: any;
        q2: any;
        c1: any;
        c2: any;
    }

    export interface ICournotDuopoly extends KG.IModel
    {

        marketDemandIntercept: number;
        marketDemandSlope: number;
        residualDemand1Intercept: number;
        residualDemand2Intercept: number;

        marketDemand: LinearDemand;
        residualDemand1: LinearDemand;
        residualDemand2: LinearDemand;

        price: number;
        q1: number;
        q2: number;
    }

    export class CournotDuopoly extends KG.Model implements ICournotDuopoly
    {

        public marketDemandIntercept;
        public marketDemandSlope;
        public residualDemand1Intercept;
        public residualDemand2Intercept;

        public marketDemand;
        public residualDemand1;
        public residualDemand2;
        public price;
        public q1;
        public q2;


        public priceLine;
        public quantityDemandedAtPrice;
        public consumerSurplus;

        constructor(definition:CournotDuopolyDefinition, modelPath?: string) {
            super(definition, modelPath);
            this.marketDemand = new LinearDemand({
                type: 'SlopeInterceptLine',
                def: {
                    b: definition.marketDemandIntercept,
                    m: definition.marketDemandSlope
                },
                curveLabel: 'P(q_1 + q_2)',
                quantityLabel: 'q_1 + q_2'
            });
            this.marketDemand.path = 'model.residualDemand2'
            this.residualDemand1 = new LinearDemand({
                type: 'SlopeInterceptLine',
                def: {
                    b: definition.marketDemandIntercept,
                    m: definition.marketDemandSlope
                },
                curveLabel: 'P(q_1 | q_2)',
                quantityLabel: 'q_1'
            });
            this.residualDemand1.path = 'model.residualDemand1'
            this.residualDemand2 = new LinearDemand({
                type: 'SlopeInterceptLine',
                def: {
                    b: definition.marketDemandIntercept,
                    m: definition.marketDemandSlope
                },
                curveLabel: 'P(q_2 | q_1)',
                quantityLabel: 'q_2'
            });
            this.residualDemand2.path = 'model.residualDemand2'

        }

        private residualDemandIntercept(otherQuantity:number) {
            return this.marketDemand.priceAtQuantity(otherQuantity);
        }

        _update(scope) {
            var d = this;
            d.marketDemand.update(scope);
            d.residualDemand1.update(scope);
            d.residualDemand2.update(scope);
            d.residualDemand1.demandFunction.b = d.residualDemandIntercept(d.q2);
            d.residualDemand2.demandFunction.b = d.residualDemandIntercept(d.q1);
            return d;
        }

    }

}