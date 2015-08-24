/// <reference path="../eg.ts"/>

module EconGraphs {

    export interface DemandDefinition extends KG.ModelDefinition
    {
        type: string;
        def: KGMath.Functions.BaseDefinition;
        className: string;
        curveLabel: string;
        quantityLabel: string;
        elasticityMethod: string;
    }

    export interface IDemand extends KG.IModel
    {
        demandFunction: KGMath.Functions.Base;
        quantityAtPrice: (price: number) => number;
        priceAtQuantity: (quantity: number) => number;
        priceElasticity: (price: number) => Elasticity;
        curve: KG.ViewObject;
        quantityAtPriceView: (price: number) => KG.Point;
        className: string;
        curveLabel: string;
        quantityLabel: string;
    }

    export class Demand extends KG.Model implements IDemand
    {

        public className;
        public curveLabel;
        public quantityLabel;
        public demandFunction;
        public quantityAtPriceView;
        public elasticity: Elasticity;
        public curve;

        constructor(definition:DemandDefinition) {
            super(definition);
            this.demandFunction = new KGMath.Functions[definition.type](definition.def);
            this.elasticity = (definition.elasticityMethod == 'point') ? new PointElasticity({}) : new MidpointElasticity({});
        }

        quantityAtPrice(price:number) {
            price = (price > 0) ? price : 0;
            var qd = this.demandFunction.xValue(price);
            return Math.max(0,qd);
        }

        priceAtQuantity(quantity:number) {
            quantity = (quantity > 0) ? quantity : 0;
            var pd = this.demandFunction.yValue(quantity);
            return Math.max(0,pd);
        }

        priceElasticity(price:number) {
            var d = this;
            if(d.elasticity instanceof MidpointElasticity) {
                d.elasticity = d.elasticity.calculateElasticity({
                    point1: {
                        x: d.quantityAtPrice(price*0.99),
                        y: price*0.99
                    },
                    point2: {
                        x: d.quantityAtPrice(price*1.01),
                        y: price*1.01
                    }});
            } else {
                var point = {
                    x: d.quantityAtPrice(price),
                    y: price
                },
                    slope = d.demandFunction.hasOwnProperty('slope') ? d.demandFunction.slope : d.demandFunction.slopeBetweenPoints(
                        {
                            x: d.quantityAtPrice(price*0.99),
                            y: price*0.99
                        }, {
                            x: d.quantityAtPrice(price*1.01),
                            y: price*1.01
                        },
                        true
                    );
                d.elasticity = d.elasticity.calculateElasticity({point:point, slope:slope});
            }
            return d.elasticity;
        }

    }

}