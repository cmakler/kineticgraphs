/// <reference path="../../../eg.ts"/>

module EconGraphs {

    export interface HicksianDemandDefinition extends KG.ModelDefinition
    {
        utilityFnDef: {utilityType: string; utilityDef: UtilityDefinition;};
        utilityLevel: any;
        otherPrice: any;
    }

    export interface IHicksianDemand extends KG.IModel
    {
        utilityFn: TwoGoodUtility;
        utilityLevel: number;
        otherPrice: number;
    }

    export class HicksianDemand extends KG.Model implements IHicksianDemand
    {

        constructor(definition:HicksianDemandDefinition,modelPath?:string) {

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

// Return the income necessary to achieve v(income,px1,py) if px is now px2
compensatedIncome(income, px1, px2, py) {
    var u = this;
    var utility = u.utility(u.optimalBundle(income, px1, py));
    return u.lowestPossibleCost(utility, px2, py);

}

// Find the lowest possible cost for a given level of utility, given px and py
lowestPossibleCost(utility, px, py) {
    return 0; // overridden by specific utility function
}

// Return the bundle that provides a given level of utility at lowest cost
lowestCostBundle(utility, px, py) {

    var u = this;

    // set income to lowest necessary to achieve utility
    var income = u.lowestPossibleCost(utility, px, py);
    return u.optimalBundle(income, px, py);

}