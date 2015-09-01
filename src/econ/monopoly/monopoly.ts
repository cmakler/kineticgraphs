/// <reference path="../eg.ts"/>

module EconGraphs {

    export interface MonopolyDefinition extends KG.ModelDefinition
    {
        demandDef: DemandDefinition;
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

            var Pref = 'model.price',
                Qref = 'model.quantity',
                ACQref = 'model.costFunction.averageTotalCost(model.quantity)',
                MCQref = 'model.costFunction.marginalCost(model.quantity)',
                MC0ref = 'model.costFunction.marginalCost(0)';

            m.producerSurplus = new KG.Area({
                data: [
                    {x: 0, y: Pref},
                    {x: Qref, y: Pref},
                    {x: Qref, y: MCQref},
                    {x: 0, y: MC0ref}
                ]
            });

            m.profit = new KG.Area({
                data: [
                    {x: 0, y: Pref},
                    {x: Qref, y: Pref},
                    {x: Qref, y: ACQref},
                    {x: 0, y: ACQref}
                ]
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