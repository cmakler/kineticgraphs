/// <reference path="../../../eg.ts"/>

module EconGraphs {

    export interface MonopolyDefinition extends KG.ModelDefinition
    {
        demand: {demandType: string; demandDef: DemandDefinition;};
        cost: {costType: string; costDef: (ProductionCostDefinition | ConstantMarginalCostDefinition | LinearMarginalCostDefinition);};
        choosePrice?: boolean;
        quantity?: any;
        price?: any;
        quantityLabel?: string;

        showAC?: any;
        showProfit?: any;
        showACandProfit?: any;
        snapToOptimalQuantity?: any;
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

        profit: number;
        profitArea: KG.Area;
        profitLabel: string;
        producerSurplus: KG.Area;

        showAC?: boolean;
        showProfit?: boolean;
        showACandProfit?: boolean;
        snapToOptimalQuantity?: boolean;
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
        public profitArea;
        public profitLabel;
        public producerSurplus;

        public showProfit;
        public showACandProfit;
        public snapToOptimalQuantity;


        constructor(definition:MonopolyDefinition,modelPath?:string) {

            definition = _.defaults(definition,{
                showProfit: true,
                snapToOptimalQuantity: true
            });

            super(definition,modelPath);

            var m = this;

            var p = m.modelProperty('price'),
                q = m.modelProperty('quantity'),
                mcq = m.modelProperty('costFunction.mc(' + q + ')'),
                mc0 = m.modelProperty('costFunction.mc(0)'),
                acq = m.modelProperty('costFunction.atc(' + q + ')'),
                profitLabel = m.modelProperty('profitLabel')

            definition.demand.demandDef.curveLabel = definition.demand.demandDef.curveLabel || 'D = AR';

            m.demandFunction = new EconGraphs[definition.demand.demandType](definition.demand.demandDef, this.modelPath + '.demandFunction');
            m.costFunction = new EconGraphs[definition.cost.costType](definition.cost.costDef, this.modelPath + '.costFunction');

            m.producerSurplus = new KG.Area({
                data: [
                    {x: 0, y: p},
                    {x: q, y: p},
                    {x: q, y: mcq},
                    {x: 0, y: mc0}
                ]
            });

            m.profitArea = new KG.Area({
                name: 'profitArea',
                className: 'growth',
                show: m.modelProperty('showACandProfit'),
                data: [
                    {x: 0, y: p},
                    {x: q, y: p},
                    {x: q, y: acq},
                    {x: 0, y: acq}
                ],
                label: {
                    text: profitLabel
                }
            });



        }

        _update(scope) {
            var m = this;
            m.demandFunction.update(scope);
            m.costFunction.update(scope);
            m.showACandProfit = (m.showProfit && m.costFunction.showAC);
            if(m.snapToOptimalQuantity && m.demandFunction instanceof LinearDemand && (m.costFunction instanceof LinearMarginalCost || m.costFunction instanceof ConstantMarginalCost)) {
                m.quantity = Math.max(0,m.demandFunction.marginalRevenueFunction.linearIntersection(m.costFunction.marginalCostFunction).x);
            }
            if(m.choosePrice) {
                m.quantity = m.demandFunction.quantityAtPrice(m.price);
                m.demandFunction.quantity = m.quantity;
            } else {
                m.price = m.demandFunction.priceAtQuantity(m.quantity);
                m.demandFunction.price = m.price;
            }
            m.profit = m.demandFunction.tr(m.quantity) - m.costFunction.tc(m.quantity);
            m.profitLabel = (m.profit > 0) ? '\\text{Profit}' : (m.profit < 0) ? '\\text{Loss}' : '';
            return m;
        }

    }

}