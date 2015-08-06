/// <reference path="../eg.ts"/>

module EconGraphs {

    export interface DemandDefinition extends KG.ModelDefinition
    {
        type: string;
        def: KGMath.Functions.BaseDefinition;
        className: string;
        curveLabel: string;
        quantityLabel: string;
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

    export class Demand extends KG.Model
    {

        public className;
        public curveLabel;
        public quantityLabel;
        public demandFunction: KGMath.Functions.Base;
        public elasticity: Elasticity;
        public curve: D3.Selection;

        constructor(definition:DemandDefinition) {
            super(definition);
            this.demandFunction = new KGMath.Functions[definition.type](definition.def);
            this.elasticity = new MidpointElasticity({point1: {x:0, y:0}, point2: {x:0, y:0}});
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
            }
            return d.elasticity;
        }

    }

}