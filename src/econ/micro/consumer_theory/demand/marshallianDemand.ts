/// <reference path="../../../eg.ts"/>

module EconGraphs {

    export interface MarshallianDemandDefinition extends UtilityDemandDefinition{
        budget: {type: string; definition: BudgetConstraintDefinition}
    }

    export interface IMarshallianDemand extends IUtilityDemand {

        budget: BudgetConstraint | KG.Selector;

        priceConsumptionCurve: (pccParams: UtilityDemandCurveParams, curveParams: KG.CurveParamsDefinition) => KG.Curve;
        incomeConsumptionCurve: (iccParams: UtilityDemandCurveParams, curveParams: KG.CurveParamsDefinition) => KG.Curve;
        engelCurve: (engelParams: UtilityDemandCurveParams, curveParams: KG.CurveParamsDefinition) => KG.Curve;

    }

    export class MarshallianDemand extends UtilityDemand implements IMarshallianDemand {

        public budget;

        constructor(definition:MarshallianDemandDefinition, modelPath?:string) {
            super(definition, modelPath);
        }

        _update(scope) {
            var d = this;
            d.utility = d.utility.update(scope);
            d.budget = d.budget.update(scope);
            d.budget.budgetSegments.forEach(function(bs) {bs.update(scope)});
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

        quantityAtIncome(income,good) {
            var d = this;
            good = good || 'x';

            // store original price in budget constraint
            var originalIncome = d.budget.income;

            // evaluate quantity demanded of this good at the given price
            d.budget.setIncome(income);
            var quantity = d.utility.optimalBundle(d.budget)[good];

            // reset budget constraint to original price
            d.budget.setIncome(originalIncome);

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

        quantityAtIncomePoint(price, incomeParams, pointParams) {
            var d = this;

            incomeParams = _.defaults(incomeParams,{
                good: 'x'
            });

            var quantityProperty = 'quantityAtIncome(' + price + ',"' + incomeParams.good + '")';

            return new KG.Point({
                name: 'q'+incomeParams.good + 'd',
                className: 'engel',
                coordinates: {
                    x: d.modelProperty(quantityProperty),
                    y: price
                },
                params: pointParams
            })
        }

        engelCurve(engelParams, curveParams) {

            engelParams = _.defaults(engelParams, {
                good: 'x',
                min: 1,
                max: 200,
                numSamplePoints: 201
            });

            var d = this,
                samplePoints = KG.samplePointsForDomain(engelParams),
                curveData = [];

            samplePoints.forEach(function(price) {
                curveData.push({x: d.quantityAtIncome(price, engelParams.good), y: price});
            });

            return new KG.Curve({
                name: 'Engel' + engelParams.good,
                data: curveData,
                params: curveParams,
                className: 'engel'
            });

        }


    }
}