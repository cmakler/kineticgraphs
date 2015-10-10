/**
 * Created by cmakler on 10/5/15.
 */

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

priceConsumptionCurve(pccParams) {

    var u = this;

    return {

        points: function (xDomain, yDomain) {

            var px,
                py,
                isGoodX = ('y' != pccParams['good']),
                minPrice = pccParams['minPrice'] || 0,
                maxPrice = pccParams['maxPrice'] || 100,
                income = pccParams['income'],
                endowment = pccParams['endowment'] || {},
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

            return functionPoints(priceConsumptionFunction, xDomain, yDomain, {
                min: minPrice,
                max: maxPrice,
                dependentVariable: 'p'
            });

        }
    }
}

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

incomeConsumptionCurve(iccParams) {

    var u = this;

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

            return functionPoints(incomeConsumptionFunction, xDomain, yDomain, {
                min: minIncome,
                max: maxIncome,
                dependentVariable: 'i'
            });

        }
    }
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

engelCurve(engelParams) {

    var u = this;

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

}

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
demandCurve(demandParams) {

    var u = this;

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
                demandFunction = function (price) {
                    if (isGoodX) {
                        compensatedIncome = (compensationPrice > 0) ? u.compensatedIncome(income, compensationPrice, price, otherPrice) : income;
                        return u.optimalBundle(compensatedIncome, price, otherPrice)[0] * numberOfConsumers;
                    } else {
                        return u.optimalBundle(income, otherPrice, price)[1] * numberOfConsumers;
                    }
                };

            return functionPoints(demandFunction, xDomain, yDomain, {
                dependentVariable: 'y',
                min: minPrice,
                max: maxPrice
            });
        },

        area: function (xDomain, yDomain) {

            xDomain = domainAsObject(xDomain);
            yDomain = domainAsObject(yDomain);


            var points = this.points(xDomain, yDomain),
                minPrice = demandParams['minPrice'] || yDomain.min,
                maxPrice = demandParams['maxPrice'] || yDomain.max;

            points.push({x: 0, y: maxPrice});
            points.push({x: 0, y: minPrice});

            return points;

        }
    }
}

// Return the decomposition bundle for a price change from px1 to px2
decompositionBundle(income, px1, px2, py) {
    var u = this;
    return u.optimalBundle(u.compensatedIncome(income, px1, px2, py), px2, py);
}