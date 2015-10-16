/// <reference path="../../../eg.ts"/>

module EconGraphs {

    export interface MarshallianDemandDefinition extends UtilityDemandDefinition{
        budget: {type: string; definition: BudgetDefinition};
        utility: {type: string; definition: TwoGoodUtilityDefinition};
    }

    export interface IMarshallianDemand extends IUtilityDemand {
        budget: Budget;
        utility: TwoGoodUtility;

        priceConsumptionCurve: (pccParams: any, curveParams: KG.CurveParamsDefinition) => KG.Curve;
        incomeConsumptionCurve: (iccParams: any, curveParams: KG.CurveParamsDefinition) => KG.Curve;
        engelCurve: (engelParams: any, curveParams: KG.CurveParamsDefinition) => KG.Curve;
        demandCurve: (demandParams: any, curveParams: KG.CurveParamsDefinition) => KG.Curve
    }

    export class MarshallianDemand extends UtilityDemand implements IMarshallianDemand {

        public budget;
        public utility;

        constructor(definition:MarshallianDemandDefinition, modelPath?:string) {
            super(definition, modelPath);
        }

        /*

         Find the price-consumption curve for a given income and other price

         The pccParams object should have the following structure:
         {
         good: the good whose price we are going to vary; must be 'x' or 'y'; 'x' by default
         minPrice: the minimum price to evaluate (0 by default)
         maxPrice: the maximum price to evaluate (100 by default)
         otherPrice: the price of the other good
         }

         */

        priceConsumptionCurve(pccParams, curveParams) {

            pccParams = _.defaults(pccParams, {
                good: 'x',
                minPrice: 0,
                maxPrice: 100,
                samplePoints: 51
            });

            var d = this,
                priceDomain = new KG.Domain(pccParams.minPrice, pccParams.maxPrice),
                samplePoints = priceDomain.samplePoints(pccParams.samplePoints),
                curveData = [];

            var initialPrice = budget['p' + pccParams.good];

            samplePoints.forEach(function(price) {

                var budget = d.budget;
                budget['p' + pccParams.good] = price;
                curveData.push(d.utility.optimalBundle(budget));

            });

            // reset budget price
            d.budget['p' + pccParams.good] = initialPrice;

            return new KG.Curve({
                name: 'PCC' + pccParams.good,
                data: curveData,
                params: curveParams,
                className: 'pcc'
            })
        }

        /*

         Find the income consumption curve (i.e., expansion path) for a given set of prices.
         The iccParams object should have the following structure:

         {
         minIncome: the minimum income to evaluate (0 by default)
         maxIncome: the maximum income to evaluate (200 by default)
         samplePoints: number of points to sample (51 by default)
         }

         */

        incomeConsumptionCurve(iccParams?, curveParams?) {

            iccParams = _.defaults(iccParams, {
                minIncome: 0,
                maxIncome: 200,
                samplePoints: 51
            });

            var d = this,
                incomeDomain = new KG.Domain(iccParams.minIncome, iccParams.maxIncome),
                samplePoints = incomeDomain.samplePoints(pccParams.samplePoints),
                curveData = [];

            var initialIncome = budget.income;

            samplePoints.forEach(function(income) {

                var budget = d.budget;
                budget.income = income;
                curveData.push(d.utility.optimalBundle(budget));

            });

            // reset budget price
            d.budget.income = initialIncome;

            return new KG.Curve({
                name: 'ICC',
                data: curveData,
                params: curveParams,
                className: 'icc'
            });
        }

        /*

         Find the Engel curve for a given set of prices
         The engelCurveParams object should have the following structure:
         {
         good: the good whose quantity demanded we are going to plot
         minIncome: the minimum income to evaluate (0 by default)
         maxIncome: the maximum income to evaluate (50 by default)
         px: price of x
         py: price of y
         }

         */

        engelCurve(engelParams, curveParams) {

            engelParams = _.defaults(engelParams, {
                good: 'x',
                minIncome: 0,
                maxIncome: 200,
                samplePoints: 51
            });

            var d = this,
                incomeDomain = new KG.Domain(iccParams.minIncome, iccParams.maxIncome),
                samplePoints = incomeDomain.samplePoints(pccParams.samplePoints),
                curveData = [];

            var initialIncome = budget.income;

            samplePoints.forEach(function(income) {

                var budget = d.budget;
                budget.income = income;
                curveData.push({x: d.utility.optimalBundle(budget)[engelParams.good], y: income});

            });

            // reset budget price
            d.budget.income = initialIncome;

            return new KG.Curve({
                name: 'Engel' + engelParams.good,
                data: curveData,
                params: curveParams,
                className: 'engel'
            });

        }

        /*

         Find the demand curve for a given income and other price

         The demandParams object should have the following structure:
         {
         good: the good whose price we are going to vary; must be 'x' or 'y'; 'x' by default
         minPrice: the minimum price to evaluate (0 by default)
         maxPrice: the maximum price to evaluate (50 by default)
         samplePoints: the number of points to sample (51 by default)
         }

         */
        demandCurve(demandParams, curveParams) {

            demandParams = _.defaults(pccParams, {
                good: 'x',
                minPrice: 0,
                maxPrice: 50,
                samplePoints: 51
            });

            var d = this,
                priceDomain = new KG.Domain(demandParams.minPrice, demandParams.maxPrice),
                samplePoints = priceDomain.samplePoints(pccParams.samplePoints),
                curveData = [];

            var initialPrice = budget['p' + pccParams.good];

            samplePoints.forEach(function(price) {

                var budget = d.budget;
                budget['p' + demandParams.good] = price;
                curveData.push({x: d.utility.optimalBundle(budget)[demandParams.good], y: price});

            });

            // reset budget price
            d.budget['p' + pccParams.good] = initialPrice;

            return new KG.Curve({
                name: 'demand' + pccParams.good,
                data: curveData,
                params: curveParams,
                className: 'demand'
            });
        }
    }
}