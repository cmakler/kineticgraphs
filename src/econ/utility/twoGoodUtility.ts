/// <reference path="../eg.ts"/>

module EconGraphs {

    export interface TwoGoodUtilityDefinition extends UtilityDefinition
    {
        indifferenceCurveLabel: string;
    }

    export interface ITwoGoodUtility extends IUtility
    {

        indifferenceCurveLabel: string;

        utility:(bundle?:KG.ICoordinates) => number;
        mux:(bundle?:KG.ICoordiantes) => number;
        muy:(bundle?:KG.ICoordinates) => number;
        mrs:(bundle?:KG.ICoordinates) => number;

        optimalBundle:(budget:Budget) => KG.ICoordinates;

        indifferenceCurveThroughBundle: (bundle:KG.ICoordinates) => KG.FunctionPlot;
        indifferenceCurveAtUtility: (utility:number) => KG.FunctionPlot;
        indifferenceCurveFamily: (graph:KG.Graph) => KG.PathFamily;

        mrsLine: (bundle:ICoordinates) => KG.Line;

        preferredToBundleArea: (bundle:ICoordinates) => KG.Area;
        dispreferredToBundleArea: (bundle:ICoordinates) => KG.Area;
        higherUtilityArea: (utility:number) => KG.Area;
        lowerUtilityArea: (utility:number) => KG.Area;

    }

    export class OneGoodUtility extends KG.Model implements ITwoGoodUtility
    {

        public indifferenceCurveLabel;

        constructor(definition:OneGoodUtilityDefinition, modelPath?:string) {

            definition = _.defaults(definition,{
                indifferenceCurveLabel: 'U'
            });
            super(definition, modelPath);

        }

        _update(scope) {
            var u = this;
            u.utilityFunction.update(scope);
            return u;
        }

        utility(bundle:ICoordinates) {
            return this.utilityFunction.value(KG.getBases(bundle));
        }

        mux(bundle:ICoordinates) {
            return this.utilityFunction.derivative(1).value(KG.getBases(bundle));
        }

        mux(bundle:ICoordiantes) {
            return this.utilityFunction.derivative(2).value(KG.getBases(bundle));
        }

        mrs(bundle:ICoordinates) {
            return this.muxAtBundle(bundle)/this.muyAtBundle(bundle);
        }

        mrsLine(bundle: ICoordinates) {
            return new KG.Line({

            })
        }





    }

}


/*






 u.indirectUtility = function (income,px,py) {

 return u.value(u.optimalBundle(income, px, py));

 };

 // Given two bundles, evaluates whether agent prefers first or second, or is indifferent
 u.bundlePreferred = function(bundles, t) {

 var u1 = u.utility(bundles[0]),
 u2 = u.utility(bundles[1]),
 percentUilityDifference = (u2 - u1)/(0.5*(u1 + u2)),
 tolerance = t || 0.01; // percent difference within which one is thought to be indifferent

 if(percentUilityDifference > tolerance) {
 return 2; //second bundle preferred
 }

 if(percentUilityDifference < -tolerance) {
 return 1; //first bundle preferred
 }

 return 0; //indifferent between two bundles

 };

 // Find the optimal bundle for a given income and prices
 u.optimalBundle = function (income, px, py) {

 if (u.budgetConstraint) {
 income = income || u.budgetConstraint.income;
 px = px || u.budgetConstraint.prices[0];
 py = py || u.budgetConstraint.prices[1];
 }

 return u._optimalBundle(income,px,py);
 };

 // Find the indifferece curve passing through the optimal bundle
 u.optimalIndifferenceCurve = function (income, px, py) {

 return u.setLevel(u.optimalBundle(income,px,py))

 };



 /*

 Find the price-consumption curve for a given income and other price

 The pccParams object should have the following structure:
 {
 good: the good whose price we are going to vary; must be 'x' or 'y'; 'x' by default
 minPrice: the minimum price to evaluate (0 by default)
 maxPrice: the maximum price to evaluate (50 by default)
 income: the consumer's income, OR a bundle {x:x, y:y} to be evaluated at current prices
 otherPrice: the price of the other good
 }

 */

u.priceConsumptionCurve = function (pccParams) {

    return {

        points: function (xDomain, yDomain) {

            var px,
                py,
                isGoodX = ('y' != pccParams['good']),
                minPrice = pccParams['minPrice'] || 0,
                maxPrice = pccParams['maxPrice'] || 100,
                income = pccParams['income'],
                endowment = pccParams['endowment']||{},
                samplePoints = pccParams['samplePoints'] || 51,
                otherPrice = pccParams['otherPrice'],
                priceConsumptionFunction = function (price) {
                    px = isGoodX ? price : otherPrice;
                    py = isGoodX ? otherPrice : price;
                    if (endowment.hasOwnProperty('x')) {
                        income = endowment.x * px + endowment.y * py;
                    }
                    return u.optimalBundle(income, px, py);
                };

            return functionPoints(priceConsumptionFunction, xDomain, yDomain, {min: minPrice, max: maxPrice, dependentVariable: 'p'});

        }
    }
};

/*

 Find the income expansion path for a given set of prices.
 The incomeExpansionParams object should have the following structure:

 {
 minIncome: the minimum income to evaluate (0 by default)
 maxIncome: the maximum income to evaluate (50 by default)
 px: price of x
 py: price of y
 }

 */

u.incomeConsumptionCurve = function (iccParams) {

    return {

        points: function (xDomain, yDomain) {

            var minIncome = iccParams['minIncome'] || 0,
                maxIncome = iccParams['maxIncome'] || 50,
                px = iccParams['px'],
                py = iccParams['py'],
                samplePoints = iccParams['samplePoints'] || 51,
                incomeConsumptionFunction = function (income) {
                    return u.optimalBundle(income, px, py);
                };

            return functionPoints(incomeConsumptionFunction, xDomain, yDomain, {min: minIncome, max: maxIncome, dependentVariable: 'i'});

        }
    }
};

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

u.engelCurve = function(engelParams) {

    return {

        points: function (xDomain, yDomain) {

            var isGoodX = ('y' != engelParams['good']),
                px = engelParams['px'],
                py = engelParams['py'],
                engelFunction = function (income) {
                    return isGoodX ? u.optimalBundle(income, px, py)[0] : u.optimalBundle(income, px, py)[1];
                };

            return functionPoints(engelFunction, xDomain, yDomain, {dependentVariable: 'y'});
        }
    }

};

/*

 Find the demand curve for a given income and other price

 The demandParams object should have the following structure:
 {
 good: the good whose price we are going to vary; must be 'x' or 'y'; 'x' by default
 minPrice: the minimum price to evaluate (0 by default)
 maxPrice: the maximum price to evaluate (50 by default)
 income: the consumer's income
 otherPrice: the price of the other good
 }

 */
u.demandCurve = function(demandParams) {

    return {

        points: function (xDomain, yDomain) {

            yDomain = domainAsObject(yDomain);

            var compensatedIncome,
                isGoodX = ('y' != demandParams['good']),
                compensationPrice = demandParams['compensationPrice'] || 0,
                income = demandParams['income'],
                numberOfConsumers = demandParams['numberOfConsumers'] || 1,
                minPrice = demandParams['minPrice'] || yDomain.min,
                maxPrice = demandParams['maxPrice'] || yDomain.max,
                otherPrice = demandParams['otherPrice'],
                samplePoints = demandParams['samplePoints'] || 51,
                demandFunction = function(price) {
                    if (isGoodX) {
                        compensatedIncome = (compensationPrice > 0) ? u.compensatedIncome(income, compensationPrice, price, otherPrice) : income;
                        return u.optimalBundle(compensatedIncome, price, otherPrice)[0] * numberOfConsumers;
                    } else {
                        return u.optimalBundle(income, otherPrice, price)[1] * numberOfConsumers;
                    }
                };

            return functionPoints(demandFunction,xDomain,yDomain,{dependentVariable:'y', min:minPrice, max:maxPrice});
        },

        area: function (xDomain, yDomain) {

            xDomain = domainAsObject(xDomain);
            yDomain = domainAsObject(yDomain);


            var points = this.points(xDomain,yDomain),
                minPrice = demandParams['minPrice'] || yDomain.min,
                maxPrice = demandParams['maxPrice'] || yDomain.max;

            points.push({x: 0, y: maxPrice});
            points.push({x: 0, y: minPrice});

            return points;

        }
    }
};

// Find the lowest possible cost for a given level of utility, given px and py
u.lowestPossibleCost = function (utility, px, py) {

    if (u.budgetConstraint) {
        px = px || u.budgetConstraint.prices[0];
        py = py || u.budgetConstraint.prices[1];
    }

    return u._lowestPossibleCost(utility, px, py);
};

// Return the bundle that provides a given level of utility at lowest cost
u.lowestCostBundle = function (utility,px,py) {

    // set income to lowest necessary to achieve utility
    var income = u.lowestPossibleCost(utility,px,py);
    return u.optimalBundle(income,px,py);

};

// Return the income necessary to achieve v(income,px1,py) if px is now px2
u.compensatedIncome = function(income,px1,px2,py) {
    var utility = u.value(u.optimalBundle(income, px1, py));
    return u._lowestPossibleCost(utility, px2, py);

};

// Return the decomposition bundle for a price change from px1 to px2
u.decompositionBundle = function (income, px1, px2, py) {

    return u.optimalBundle(u.compensatedIncome(income,px1,px2,py), px2, py);

};

return u;

}

};

