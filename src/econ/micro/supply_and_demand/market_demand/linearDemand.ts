/// <reference path="../../../eg.ts"/>

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
        priceIntercept: number;
        quantityIntercept: number;
        priceInterceptPoint: KG.Point;
        quantityInterceptPoint: KG.Point;
    }

    export class LinearDemand extends Demand implements ILinearDemand
    {

        public priceIntercept;
        public quantityIntercept;
        public priceInterceptPoint;
        public quantityInterceptPoint;

        constructor(definition:LinearDemandDefinition, modelPath?:string) {
            super(definition,modelPath);

            var demand = this;

            demand.priceInterceptPoint = new KG.Point({
                name: 'demandPriceIntercept',
                coordinates: {x: 0, y: demand.modelProperty('priceIntercept')},
                className: 'demand',
                yDrag: definition.priceInterceptDrag
            });

            demand.quantityInterceptPoint = new KG.Point({
                name: 'demandQuantityIntercept',
                coordinates: {x: demand.modelProperty('quantityIntercept'), y:0},
                className: 'demand',
                xDrag: definition.quantityInterceptDrag
            });

            demand.curve = new KG.Line({
                name: 'demand',
                className: 'demand',
                arrows: 'NONE',
                lineDef: definition.def,
                label: {
                    text: definition.curveLabel
                }
            });

            demand.consumerSurplus = new KG.Area({
                name: 'consumerSurplus',
                className: 'demand',
                data: [
                    {x: demand.modelProperty('quantity'), y: definition.price},
                    {x: 0, y: definition.price},
                    {x: 0, y: demand.modelProperty('quantityIntercept')}
                ],
                label: {
                    text: "CS"
                }
            });

            demand.marginalRevenueFunction = new KGMath.Functions.Linear({
                intercept: demand.modelProperty('demandFunction.yIntercept'),
                slope: KG.multiplyDefs(demand.modelProperty('demandFunction.slope'),2)
            });

            demand.marginalRevenueCurve = new KG.Line({
                name: 'marginalRevenue',
                className: 'marginalRevenue',
                linear: demand.modelProperty('marginalRevenueFunction'),
                label: {
                    text: 'MR'
                }
            });

            demand.totalRevenueFunction = demand.marginalRevenueFunction.integral(0,0,demand.modelProperty('totalRevenueFunction'));

            demand.totalRevenueCurve = new KG.FunctionPlot({
                name: 'totalRevenue',
                className: 'totalRevenue',
                fn: demand.modelProperty('totalRevenueFunction'),
                label: {
                    text: 'TR'
                }
            });

        }

        _update(scope) {
            var d = this;
            d.demandFunction.update(scope);
            d.marginalRevenueFunction.update(scope);
            d.totalRevenueFunction.update(scope);
            if(d.price) {
                d.quantity = d.quantityAtPrice(d.price)
            } else if(d.quantity) {
                d.price = d.priceAtQuantity(d.quantity)
            }
            d.priceIntercept = d.demandFunction.yValue(0);
            d.quantityIntercept = d.demandFunction.xValue(0);
            return d;
        }



    }

}