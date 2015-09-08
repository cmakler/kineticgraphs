/// <reference path="../eg.ts"/>

module EconGraphs {

    export interface PointSlopeDemandDefinition extends DemandDefinition
    {
        def: KGMath.Functions.LinearDefinition;
    }

    export interface LinearDemandDefinition extends DemandDefinition
    {
        def: KGMath.Functions.LinearDefinition;
        priceInterceptDrag?: string;
        quantityInterceptDrag?: string;
    }

    export interface ILinearDemand extends IDemand
    {
        demandFunction: KGMath.Functions.Linear;
        marginalRevenue: KGMath.Functions.Linear;
        priceIntercept: number;
        quantityIntercept: number;
        priceInterceptPoint: KG.Point;
        quantityInterceptPoint: KG.Point;
    }

    export class LinearDemand extends Demand implements ILinearDemand
    {

        public marginalRevenue;
        public priceIntercept;
        public quantityIntercept;
        public priceInterceptPoint;
        public quantityInterceptPoint;

        constructor(definition:LinearDemandDefinition) {
            super(definition);
            this.marginalRevenue = new KGMath.Functions.Linear({point1: {x:0, y:0}, point2: {x:0,y:0}});
            this.priceInterceptPoint = new KG.Point({
                name: 'demandPriceIntercept',
                coordinates: {x: 0, y: this.modelProperty('priceIntercept')},
                size: 200,
                className: 'demand',
                yDrag: definition.priceInterceptDrag
            });
            this.quantityInterceptPoint = new KG.Point({
                name: 'demandQuantityIntercept',
                coordinates: {x: this.modelProperty('quantityIntercept'), y:0},
                size: 200,
                className: 'demand',
                xDrag: definition.quantityInterceptDrag
            });
            this.curve = new KG.Line({
                name: 'demand',
                className: 'demand',
                arrows: 'NONE',
                lineDef: definition.def,
                label: {
                    text: definition.curveLabel
                }
            });
            this.consumerSurplus = new KG.Area({
                name: 'consumerSurplus',
                className: 'demand',
                data: [
                    {x: this.modelProperty('quantity'), y: definition.price},
                    {x: 0, y: definition.price},
                    {x: 0, y: this.modelProperty('quantityIntercept')}
                ],
                label: {
                    text: "CS"
                }
            })

        }

        _update(scope) {
            var d = this;
            d.demandFunction.update(scope);
            d.quantity = d.quantityAtPrice(d.price);
            d.priceIntercept = d.demandFunction.yValue(0);
            d.quantityIntercept = d.demandFunction.xValue(0);
            d.marginalRevenue.p1 = {x:0, y:d.priceIntercept};
            d.marginalRevenue.p2 = {x:d.quantityIntercept/2, y:0};
            return d;
        }

    }

}