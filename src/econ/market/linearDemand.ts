/// <reference path="../eg.ts"/>

module EconGraphs {

    export interface LinearDemandDefinition extends DemandDefinition
    {
        def: KGMath.Functions.LinearDefinition;
    }

    export interface ILinearDemand extends IDemand
    {
        marginalRevenue: KGMath.Functions.Linear;
        priceIntercept: number;
        quantityIntercept: number;
    }

    export class LinearDemand extends Demand
    {

        public marginalRevenue;
        public priceIntercept;
        public quantityIntercept;

        constructor(definition:LinearDemandDefinition) {
            super(definition);
            this.marginalRevenue = new KGMath.Functions.TwoPointLine({p1: {x:0, y:0}, p2: {x:0,y:0}});
        }

        _update(scope) {
            var d = this;

            d.priceIntercept = d.demandFunction.yValue(0);
            d.quantityIntercept = d.demandFunction.xValue(0);
            d.marginalRevenue.p1 = {x:0, y:d.priceIntercept};
            d.marginalRevenue.p2 = {x:d.quantityIntercept/2, y:0};
            return d;
        }







    }

}