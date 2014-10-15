/*
These are function constructors.

Each takes a set of parameters and returns a function
which will transform an independent variable (t)
into an (x,y) coordinate object of the form {x: 1, y:2}

*/

var functionDefinitions = {}

function KineticGraphFunction(type, params) {

    return functionDefinitions[type](params)

}



function returnCoordinates(xVal,yVal,options) {
    if (options && options.minZero) {
        xVal = Math.max(0, xVal);
        yVal = Math.max(0, yVal);
    }
    if (options && options.yIndependent) {
        return {x: yVal, y: xVal}
    } else {
        return {x: xVal, y: yVal}
    }
}

//the coefficients object should be of the form [ {power: p, coefficient: c}.
//for example, f(x) = x^2 + 3x + 4 would be described by
// [ {power:2, coefficient: 1}, {power:1, coefficient: 3}, {power: 0, coefficient: 4} ]

functionDefinitions.polynomialFunction = function(p) {

    var coefficients = p.coefficients || [],
        options = p.options || {};

    return function(xVal) {
        var yVal = 0;
        for(var i = 0; i< coefficients.length; i++) {
            var c = parseFloat(coefficients[i]['coefficient']),
                p = parseFloat(coefficients[i]['power']);
            yVal += c*Math.pow(xVal,p);
        }
        return returnCoordinates(xVal,yVal,options);
    }
}

functionDefinitions.linearFunction = function(p) {

    var slope = p.slope,
        intercept = p.intercept,
        options = p.options;

    return functionDefinitions.polynomialFunction(
        {coefficients: [
            {power: 1, coefficient: slope},
            {power: 0, coefficient: intercept}
        ],
        options: options })
}

functionDefinitions.logFunction = function(coefficient, intercept, options) {
    intercept = intercept || 0;
    return function(xVal) {
        var yVal = intercept + coefficient*Math.log(xVal);
        return returnCoordinates(xVal, yVal, options);
    }
}

functionDefinitions.parametricFunction = function(xFunction, yFunction) {
    return function (tVal) {
        return {x: xFunction(tVal).y, y: yFunction(tVal).y}
    }
}

/*
Contour functions take an indpendent variable (x by default) and a z value and return an (x,y) pair.
Set indIsY = true if y is the independent variable.

The additive contour function constructor assumes that the z value is found by adding a function of x plus a function of y:

U(x,y) = f(x) + g(y)

Therefore to find the y-value that makes f(x) + g(y) = z true for a given x and z, the formula is:

y = g-inverse(z - f(x))

and similarly

x = f-inverse(z - g(y))

*/

function additiveContourFunctionConstructor(xFunction,yFunction,xInverseFunction,yInverseFunction,level) {
    return function(inputValue,options) {
        var xVal, yVal;
        if (options && options.yIndependent) {
            yVal = inputValue;
            xVal = xInverseFunction(level - yFunction(yVal));
        } else {
            xVal = inputValue;
            yVal = yInverseFunction(level - xFunction(xVal));
        }
        return {x: xVal, y: yVal}
    }
}

// Contour function for f(x,y) = alpha*log(x) + beta*log(y)
functionDefinitions.logLinearContourFunction = function(p) {

    var alpha = p.alpha,
        beta = p.beta || 1 - alpha,
        point = p.point;

    var xFunction = function(x) {
            return alpha * Math.log(x)
        },
        yFunction = function(y) {
            return beta * Math.log(y)
        },
        xInverseFunction = function(y) {
            return Math.exp(y/alpha)
        },
        yInverseFunction = function(x) {
            return Math.exp(x/beta)
        },
        level = xFunction(point.x) + yFunction(point.y);
    return additiveContourFunctionConstructor(xFunction, yFunction, xInverseFunction, yInverseFunction, level)
}

// Contour function for f(x,y) = alpha*x + beta*y
functionDefinitions.linearContourFunction = function(p) {

    var alpha = p.alpha,
        beta = p.beta,
        point = p.point;

    var xFunction = function (x) {
            return alpha * x
        },
        yFunction = function (y) {
            return beta * y
        },
        xInverseFunction = function (y) {
            return y / alpha
        },
        yInverseFunction = function (x) {
            return x / beta
        },
        level = xFunction(point.x) + yFunction(point.y);
    return additiveContourFunctionConstructor(xFunction, yFunction, xInverseFunction, yInverseFunction, level)
}

// Contour function for f(x,y) = (ax)x^2 + (bx)x + cx + (ay)y^2 + (by)y + cy
functionDefinitions.quadraticContourFunction = function(p) {

    function quadratic(a,b,c,x) {
        return a*x*x + b*x + c;
    }

    function inverseQuadratic(a,b,c,y) {
        return (-b - Math.sqrt(b * b - (4 * a * (c - y)))) / (2 * a)
    }

    var xFunction = function (x) {
            return p.alpha * x
        },
        yFunction = function (y) {
            return p.beta * y
        },
        xInverseFunction = function (y) {
            return y / p.alpha
        },
        yInverseFunction = function (x) {
            return x / p.beta
        };
    return additiveContourFunctionConstructor(xFunction, yFunction, xInverseFunction, yInverseFunction, level)
}

/* Indifference Curve Diagrams */

// Return the function describing a standard budget constraint, given prices and income.
functionDefinitions.budgetConstraint = function(p) {

    return functionDefinitions.linearContourFunction({
        alpha: p.px,
        beta: p.py,
        point: {x: p.income / p.px, y: 0}
    })
}

// Return the indifference curve passing through a given point for a set of Cobb Douglass utility function parameters: U(x,y) = a(ln x) + b(ln y).
functionDefinitions.cobbDouglassIndifferenceCurve = function(p) {
    return functionDefinitions.logLinearContourFunction(p)
}

// Return the optimal bundle for a set of Cobb Douglass utility function and budget line parameters.
functionDefinitions.optimalCobbDouglassBundle = function(p) {
    return {
        x: (p.alpha / (p.alpha + p.beta))* p.income/ p.px,
        y: (p.beta / (p.alpha + p.beta))* p.income/ p.py
    }
}

// Calculate the optimal bundle for a set of Cobb Douglass utility function and budget line parameters,
// and return the indifference curve passing through that point.
functionDefinitions.optimalCobbDouglassIndifferenceCurve = function(p) {
    p.point = functionDefinitions.optimalCobbDouglassBundle(p)
    return functionDefinitions.cobbDouglassIndifferenceCurve(p);
}

// Return the indifference curve passing through a given point for the case of two perfect substitutes: U(x,y) = ax + by
functionDefinitions.perfectSubstituteIndifferenceCurve = function(p) {
    return functionDefinitions.linearContourFunction(p)
}

// Return the optimal bundle for a set of perfect substitute utility function and budget line parameters.
functionDefinitions.optimalPerfectSubstituteBundle = function(p) {
    var all_x = p.income/ p.px,
        all_y = p.income/ p.py,
        mrs_over_prices = (p.alpha / p.px)/(p.beta / p.py);

    if(mrs_over_prices > 1) {
        return {x: all_x, y: 0}; // MRS(X,Y) > Px/Py => only consume X
    } else if(mrs_over_prices < 1) {
        return {x: 0, y: all_y}; // MRS(X,Y) < Px/Py => only consume Y
    } else {
        return {x: 0.5*all_x, y: 0.5*all_y}; // MRS(X,Y) = Px/Py => assume split your income evenly
    }
}

// Calculate the optimal bundle for a set of perfect substitute utility function and budget line parameters,
// and return the indifference curve passing through that point.


