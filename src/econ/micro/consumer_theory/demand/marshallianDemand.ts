/// <reference path="../../../eg.ts"/>

module EconGraphs {

    export interface MarshallianDemandDefinition extends UtilityDemandDefinition{
        budget?: {type: string; definition: BudgetConstraintDefinition};
        budgetSelector?: KG.SelectorDefinition
    }

    export interface IMarshallianDemand extends IUtilityDemand {

        budget: BudgetConstraint;
        budgetSelector: KG.Selector;

        priceConsumptionCurve: (pccParams: UtilityDemandCurveParams, curveParams: KG.CurveParamsDefinition) => KG.Curve;
        incomeConsumptionCurve: (iccParams: UtilityDemandCurveParams, curveParams: KG.CurveParamsDefinition) => KG.Curve;
        engelCurve: (engelParams: UtilityDemandCurveParams, curveParams: KG.CurveParamsDefinition) => KG.Curve;

    }

    export class MarshallianDemand extends UtilityDemand implements IMarshallianDemand {

        public budget;
        public budgetSelector;

        constructor(definition:MarshallianDemandDefinition, modelPath?:string) {
            super(definition, modelPath);

            var d = this;

        }

        _update(scope) {
            var d = this;
            if(d.hasOwnProperty('utilitySelector')) {
                d.utility = d.utilitySelector.update(scope).selectedObject;
            } else {
                d.utility.update(scope);
            }
            if(d.hasOwnProperty('budgetSelector')) {
                d.budget = d.budgetSelector.update(scope).selectedObject;
            } else {
                d.budget.update(scope);
            }

            return d;
        }

        quantityAtPrice(price,good) {
            var d = this;
            good = good || 'x';

            // store original price in budget constraint
            var originalPrice = d.budget['p' + good];

            // evaluate quantity demanded of this good at the given price
            d.budget.setPrice(price,good);
            var quantity = d.utility.optimalBundle(d.budget)[good];

            // reset budget constraint to original price
            d.budget.setPrice(originalPrice,good);

            return quantity;

        }

        priceConsumptionCurve(pccParams, curveParams) {

            pccParams = _.defaults(pccParams, {
                good: 'x',
                min: 1,
                max: 100,
                numSamplePoints: 100
            });

            var d = this,
                budget = d.budget,
                samplePoints = KG.samplePointsForDomain(pccParams),
                curveData = [];

            var initialPrice = budget['p' + pccParams.good];

            samplePoints.forEach(function(price) {
                budget['p' + pccParams.good] = price;
                curveData.push(d.utility.optimalBundle(budget));
            });

            // reset budget price
            budget['p' + pccParams.good] = initialPrice;

            return new KG.Curve({
                name: 'PCC' + pccParams.good,
                data: curveData,
                params: curveParams,
                className: 'pcc'
            })
        }

        incomeConsumptionCurve(iccParams?, curveParams?) {

            iccParams = _.defaults(iccParams, {
                min: 1,
                max: 200,
                numSamplePoints: 200
            });

            var d = this,
                budget = d.budget,
                samplePoints = KG.samplePointsForDomain(iccParams),
                curveData = [];

            var initialIncome = budget.income;

            samplePoints.forEach(function(income) {
                budget.income = income;
                curveData.push(d.utility.optimalBundle(budget));
            });

            // reset budget price
            budget.income = initialIncome;

            return new KG.Curve({
                name: 'ICC',
                data: curveData,
                params: curveParams,
                className: 'icc'
            });
        }

        engelCurve(engelParams, curveParams) {

            engelParams = _.defaults(engelParams, {
                good: 'x',
                min: 1,
                max: 200,
                numSamplePoints: 201
            });

            var d = this,
                budget = d.budget,
                samplePoints = KG.samplePointsForDomain(engelParams),
                curveData = [];

            var initialIncome = budget.income;

            samplePoints.forEach(function(income) {
                budget.income = income;
                curveData.push({x: d.utility.optimalBundle(budget)[engelParams.good], y: income});
            });

            // reset budget price
            budget.income = initialIncome;

            return new KG.Curve({
                name: 'Engel' + engelParams.good,
                data: curveData,
                params: curveParams,
                className: 'engel'
            });

        }


    }
}