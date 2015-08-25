/// <reference path="../eg.ts"/>

module EconGraphs {

    export interface LinearDemandDefinition extends DemandDefinition
    {
        def: KGMath.Functions.LinearDefinition;
    }

    export interface ILinearDemand extends IDemand
    {
        demandFunction: KGMath.Functions.Linear;
        marginalRevenue: KGMath.Functions.Linear;
        priceIntercept: number;
        quantityIntercept: number;
        priceInterceptPoint: KG.Point;
        quantityInterceptPoint: KG.Point;
        priceLine: KG.Line;
        quantityDemandedAtPrice: KG.Point;
    }

    export class LinearDemand extends Demand implements ILinearDemand
    {

        public marginalRevenue;
        public priceIntercept;
        public quantityIntercept;
        public priceInterceptPoint;
        public quantityInterceptPoint;
        public priceLine;
        public quantityDemandedAtPrice;

        constructor(definition:LinearDemandDefinition) {
            super(definition);
            this.marginalRevenue = new KGMath.Functions.TwoPointLine({p1: {x:0, y:0}, p2: {x:0,y:0}});
            this.priceInterceptPoint = new KG.Point({
                name: 'demandPriceIntercept',
                coordinates: {x: 0, y: 'params.demandPriceIntercept'},
                size: 200,
                className: 'demand',
                yDrag: true
            });
            this.quantityInterceptPoint = new KG.Point({
                name: 'demandQuantityIntercept',
                coordinates: {x: 'params.demandQuantityIntercept', y:0},
                size: 200,
                className: 'demand',
                xDrag: true
            });
            this.curve = new KG.Line({
                name: 'demand',
                className: 'demand',
                arrows: 'NONE',
                type: definition.type,
                def: definition.def,
                label: {
                    text: 'D'
                }
            });
            this.priceLine = new KG.Line({
                name: 'priceLine',
                color: 'grey',
                arrows: 'NONE',
                type: 'HorizontalLine',
                yDrag: 'price',
                def: {
                    y: 'params.price'
                }
            });
            this.quantityDemandedAtPrice = new KG.Point({
                name: 'quantityDemandedAtPrice',
                coordinates: {x: 'model.quantityAtPrice(params.price)', y: 'params.price'},
                size: 500,
                color: 'black',
                yDrag: true,
                label: {
                    text: 'A'
                },
                droplines: {
                    vertical: 'Q^D_A',
                    horizontal: 'P_A'
                }
            })
        }

        _update(scope) {
            var d = this;
            d.demandFunction.update(scope);
            d.priceIntercept = d.demandFunction.yValue(0);
            d.quantityIntercept = d.demandFunction.xValue(0);
            d.marginalRevenue.p1 = {x:0, y:d.priceIntercept};
            d.marginalRevenue.p2 = {x:d.quantityIntercept/2, y:0};
            return d;
        }

    }

}