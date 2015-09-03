/// <reference path="../eg.ts"/>

module EconGraphs {

    export interface MonopolyDefinition extends KG.ModelDefinition
    {
        demandType: string;
        demandDef: DemandDefinition;
        costType: string;
        costDef: ProductionCostDefinition;
        choosePrice?: boolean;
        quantity?: any;
        price?: any;
        quantityLabel?: string;
    }

    export interface IMonopoly extends KG.IModel
    {

        demandFunction: Demand;
        costFunction: ProductionCost;

        choosePrice: boolean;

        price: number;
        quantity: number;

        optimalPrice: number;
        optimalQuantity: number;
        optimalOffer: KG.Point;
        MRMCIntersection: KG.Point;

        profit: KG.Area;
        producerSurplus: KG.Area;
    }

    export class Monopoly extends KG.Model implements IMonopoly
    {

        public demandFunction;
        public costFunction;

        public choosePrice;

        public price;
        public quantity;

        public optimalPrice;
        public optimalQuantity;
        public optimalOffer;
        public MRMCIntersection;

        public profit;
        public producerSurplus;

        constructor(definition:MonopolyDefinition) {
            super(definition);

            var m = this;

            var p = m.modelProperty('price'),
                q = m.modelProperty('quantity'),
                mcq = m.modelProperty('costFunction.marginalCost(' + q + ')'),
                mc0 = m.modelProperty('costFunction.marginalCost(0)'),
                acq = m.modelProperty('costFunction.averageCost(' + q + ')');

            m.demandFunction = new EconGraphs[definition.demandType](definition.demandDef, this.modelPath + '.demandFunction');
            m.costFunction = new EconGraphs[definition.costType](definition.costDef, this.modelPath + '.costFunction');

            m.producerSurplus = new KG.Area({
                data: [
                    {x: 0, y: p},
                    {x: q, y: p},
                    {x: q, y: mcq},
                    {x: 0, y: mc0}
                ]
            });

            m.profit = new KG.Area({
                data: [
                    {x: 0, y: p},
                    {x: q, y: p},
                    {x: q, y: acq},
                    {x: 0, y: acq}
                ],
                label: {
                    text: '\\pi'
                }
            });

        }

        _update(scope) {
            var m = this;
            m.demandFunction.update(scope);
            m.costFunction.update(scope);
            if(m.choosePrice) {
                m.quantity = m.demandFunction.quantityAtPrice(m.price);
            } else {
                m.price = m.demandFunction.priceAtQuantity(m.quantity);
            }
            return m;
        }

    }

}