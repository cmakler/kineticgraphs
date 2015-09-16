/// <reference path="../eg.ts"/>

module EconGraphs {

    export interface DemandDefinition extends KG.ModelDefinition
    {
        type: string;
        def: KGMath.Functions.BaseDefinition;
        className?: string;
        curveLabel?: string;
        quantityLabel?: string;
        elasticityMethod?: string;
        price?: any;
        quantity?: any;
        priceDrag?: string;
        quantityDrag?: string;
    }

    export interface IDemand extends KG.IModel
    {
        demandFunction: KGMath.Functions.Base;
        quantityAtPrice: (price: number) => number;
        priceAtQuantity: (quantity: number) => number;
        priceElasticity: (price: number) => Elasticity;
        curve: KG.ViewObject;
        className: string;
        curveLabel: string;
        quantityLabel: string;

        price: number;
        quantity: number;

        priceLine: KG.HorizontalLine;
        quantityLine: KG.VerticalLine;
        quantityDemandedPoint: KG.Point;
        consumerSurplus: KG.Area;
        marginalRevenueAtQuantitySlope: (quantity:number, label:string) => KG.Line;
        totalRevenueAtQuantityPoint: (quantity:number, label:string) => KG.Point;
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

        public marginalRevenueFunction;
        public totalRevenueFunction;

        public price;
        public quantity;

        public priceLine;
        public quantityLine;
        public quantityDemandedPoint;
        public consumerSurplus;
        public marginalRevenueCurve;
        public totalRevenueCurve;


        constructor(definition:DemandDefinition, modelPath?:string) {

            definition.className = definition.className || 'demand';
            definition.curveLabel = definition.curveLabel || 'D';

            super(definition, modelPath);
            this.demandFunction = new KGMath.Functions[definition.type](definition.def);

            this.elasticity = (definition.elasticityMethod == 'point') ? new PointElasticity({}) : (definition.elasticityMethod = 'constant') ? new ConstantElasticity({}) : new MidpointElasticity({});

            var priceLineDrag = (typeof definition.price == 'string') ? definition.price.replace('params.','') : false;

            this.priceLine = new KG.HorizontalLine({
                name: 'priceLine',
                color: 'grey',
                arrows: 'NONE',
                yDrag: definition.priceDrag,
                y: definition.price
            });

            this.quantityLine = new KG.VerticalLine({
                name: 'quantityLine',
                color: 'grey',
                arrows: 'NONE',
                xDrag: definition.quantityDrag,
                x: definition.quantity
            });

            this.quantityDemandedPoint = new KG.Point({
                name: 'quantityDemandedAtPrice',
                coordinates: {x: this.modelProperty('quantity'), y: this.modelProperty('price')},
                size: 500,
                color: 'black',
                yDrag: definition.price,
                xDrag: definition.quantity,
                label: {
                    text: 'A'
                },
                droplines: {
                    vertical: 'Q^D_A',
                    horizontal: 'P_A'
                }
            });

        }

        _update(scope) {
            var d = this;
            if(d.price) {
                d.quantity = d.quantityAtPrice(d.price)
            } else if(d.quantity) {
                d.price = d.priceAtQuantity(d.quantity)
            }
            return d;
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
            } else if(d.elasticity instanceof PointElasticity) {
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

        tr(q) {
            return this.totalRevenueFunction.yValue(q);
        }

        mr(q) {
            return this.marginalRevenueFunction.yValue(q);
        }

        marginalRevenueAtQuantitySlope(q, label?) {
            var labelSubscript = label ? '_{' + label + '}' : '';
            return new KG.Line({
                name: 'MRslopeLine' + label,
                className: 'marginalRevenue dotted',
                lineDef: {
                    point: {x: q, y: this.modelProperty('tr('+q+')')},
                    slope: this.mr(q)
                },
                label: {
                    text: '\\text{slope} = MR(q'+ labelSubscript +')'
                }
            });
        }

        totalRevenueAtQuantityPoint(q, label?, dragParam?) {
            var labelSubscript = label ? '_{' + label + '}' : '';
            return new KG.Point({
                name: 'totalRevenueAtQ' + label,
                coordinates: {x: q, y: this.tr(q)},
                className: 'totalRevenue',
                xDrag: dragParam,
                label: {
                    text: label
                },
                droplines: {
                    vertical: 'q' + labelSubscript,
                    horizontal: 'TR(q'+ labelSubscript +')'
                }
            })
        }

    }

}