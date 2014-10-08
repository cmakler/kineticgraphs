/*
These are function constructors.

Each takes a set of parameters and returns a function
which will transform an independent variable (t)
into an (x,y) coordinate object of the form {x: 1, y:2}

*/

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

function polynomialFunction(coefficients, options) {
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

function linearFunction(slope, intercept, options) {
    var m = slope,
        b = intercept;

    /*if(options && options.yIndependent) {
        m = 1/slope;
        b = -intercept/slope;
    }*/
    return polynomialFunction(
        [
            {power: 1, coefficient: m},
            {power: 0, coefficient: b}
        ],
        options)
}

function logFunction(coefficient, intercept, options) {
    intercept = intercept || 0;
    return function(xVal) {
        var yVal = intercept + coefficient*Math.log(xVal);
        return returnCoordinates(xVal, yVal, options);
    }
}

function parametricFunction(xFunction, yFunction) {
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

function additiveContourFunctionConstructor(xFunction,yFunction,xInverseFunction,yInverseFunction) {
    return function(indVal,depVal,indIsY) {
        var xVal, yVal;
        if (indIsY) {
            yVal = indVal;
            xVal = xInverseFunction(depVal - yFunction(yVal));
        } else {
            xVal = indVal;
            yVal = yInverseFunction(depVal - xFunction(xVal));
        }
        return {x: xVal, y: yVal}
    }
}

// Contour function for f(x,y) = alpha*log(x) + beta*log(y)
function logLinearContourFunction(alpha, beta) {
    beta = beta || 1 - alpha; // if beta isn't set, use 1 - alpha by default
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
        };
    return additiveContourFunctionConstructor(xFunction,yFunction,xInverseFunction,yInverseFunction)
}

// Contour function for f(x,y) = alpha*x + beta*y
function linearContourFunction(alpha,beta) {
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
        };
    return additiveContourFunctionConstructor(xFunction, yFunction, xInverseFunction, yInverseFunction)
}

// Contour function for f(x,y) = (ax)x^2 + (bx)x + cx + (ay)y^2 + (by)y + cy
function quadraticContourFunction(ax, bx, cx, ay, by, cy) {

    function quadratic(a,b,c,x) {
        return a*x*x + b*x + c;
    }

    function inverseQuadratic(a,b,c,y) {
        return (-b - Math.sqrt(b * b - (4 * a * (c - y)))) / (2 * a)
    }

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
        };
    return additiveContourFunctionConstructor(xFunction, yFunction, xInverseFunction, yInverseFunction)
}