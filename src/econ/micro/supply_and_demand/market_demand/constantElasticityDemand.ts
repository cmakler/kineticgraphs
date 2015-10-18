/// <reference path="../../../eg.ts"/>

module EconGraphs {

    export interface ConstantElasticityDemandDefinition extends DemandDefinition
    {
        def: KGMath.Functions.MonomialDefinition;
    }

    export interface IConstantElasticityDemand extends IDemand
    {
        demandFunction: KGMath.Functions.Monomial;
        priceLine: KG.Line;
        quantityDemandedAtPrice: KG.Point;
        slopeAtPrice: (price: number) => number;
    }

    export class ConstantElasticityDemand extends Demand implements IConstantElasticityDemand
    {
        public priceLine;
        public slopeLine;
        public quantityDemandedAtPrice;

        constructor(definition:ConstantElasticityDemandDefinition, modelPath?: string) {
            super(definition,modelPath);
            this.curve = new KG.FunctionPlot({
                name: 'demand',
                className: 'demand',
                arrows: 'NONE',
                fn: 'model.demandFunction',
                label: {
                    text: 'D'
                }
            });
            this.priceLine = new KG.HorizontalLine({
                name: 'priceLine',
                color: 'grey',
                arrows: 'NONE',
                type: 'HorizontalLine',
                yDrag: 'price',
                y: 'params.price'
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
                    vertical: 'Q^D(P)',
                    horizontal: 'P'
                }
            });
            this.slopeLine = new KG.Line({
                name: 'slopeLine',
                className: 'demand dotted',
                lineDef: {
                    point: {x: 'model.quantityAtPrice(params.price)', y: 'params.price'},
                    slope: '1/model.slopeAtPrice(params.price)'
                },
                label: {
                    text: 'model.slopeAtPriceWords(params.price)'
                }
            });
            this.elasticity.elasticity = definition.def.powers[1];
        }

        _update(scope) {
            var d = this;
            d.demandFunction.update(scope);
            d.slopeLine.linear.update(scope);
            d.elasticity.update(scope);
            return d;
        }

        slopeAtPrice = function(price) {
            var d = this,
                a = d.demandFunction.level,
                b = d.demandFunction.powers[1];
            return (-1)*a*b*Math.pow(price,-(1+b))
        }

        slopeAtPriceWords = function(price) {
            return "\\frac { dQ^D }{ dP } = " + this.slopeAtPrice(price).toFixed(2);
        }

    }

}