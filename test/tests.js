test( "hello test", function( assert ) {
  assert.ok( 1 == "1", "Passed!" );
});

module('monomial function tests');

test( "simple monomial test", function( assert ) {
	var monomial_definition = {coefficient: 2, powers: [3], bases: [2]},
		expected_output = 16,
		fn = new KGMath.Functions.Monomial(monomial_definition),
		actual_output = fn.value();
	assert.equal(actual_output, expected_output, 'We expect 2x^3 to be 16 when x = 2')
});

test( "simple monomial test with zero power", function( assert ) {
	var monomial_definition = {coefficient: 2, powers: [0]},
		expected_output = 2,
		fn = new KGMath.Functions.Monomial(monomial_definition),
		actual_output = fn.value([2]);
	assert.equal(actual_output, expected_output, 'We expect 2x^0 to be 2 when x = 2')
});

test( "complex monomial test", function( assert ) {
	var monomial_definition = {coefficient: 2, powers: [3,2]},
		input = [2,0.5],
		expected_output = 4,
		fn = new KGMath.Functions.Monomial(monomial_definition),
		actual_output = fn.value(input);
	assert.equal(actual_output, expected_output, 'We expect 2(x^3)(y^2) to be 4 when x = 2 and y = 0.5');

});

test( "level curve tests", function( assert ) {
	var fn = new KGMath.Functions.Monomial({coefficient: 1, powers: [1,1], level: 4});

	assert.close(fn.yValue(2),2, 0.01, 'We expect y = 2 when x = 2 along the level curve xy = 4');
	assert.close(fn.xValue(2),2, 0.01, 'We expect x = 2 when y = 2 along the level curve xy = 4');
	
	fn.setLevel(fn.value([2,1]));
	assert.close(fn.yValue(1),2, 0.01, 'We expect y = 2 when x = 1 along the level curve of f(x,y) = xy passing through (2,1)');
	assert.close(fn.xValue(2),1, 0.01, 'We expect x = 1 when y = 2 along the level curve of f(x,y) = xy passing through (2,1)');

	fn.setPowers([1,1,1,1]); // f(x,y,a,b) = xyab
	fn.setLevel(8);
	fn.setBases([1,2,2,2]);
	assert.close(fn.yValue(2),1, 0.01, 'We expect y = 1 when x = 2, a = 2, and b = 2 along the level curve xyab = 8');
	
});

test( "set bases after the fact", function( assert ) {
	var monomial_definition = {coefficient: 2, powers: [3,2]},
		expected_output = 4,
		fn = new KGMath.Functions.Monomial(monomial_definition);
	fn.setBases([2,0.5]);
	var actual_output = fn.value();
	assert.equal(actual_output, expected_output, 'We expect 2(x^3)(y^2) to be 8 when x = 2 and y = 0.5');
	fn.setLevel(6);
	assert.equal(fn.level, 6, 'We expect to be able to set the level to 4.')
	fn.setLevel(fn.value([1,1]));
	assert.equal(fn.level, 2, 'We expect to be able to set the level to the value of the monomial at (1,1).')
});

test( "take a simple derivative of a monomial", function( assert ) {
	var monomial_definition = {coefficient: 2, powers: [3], bases: [5]},
		expected_output = 2,
		fn = new KGMath.Functions.Monomial(monomial_definition),
		der = fn.derivative();
	assert.equal(der.coefficient, 6, 'We expect the coefficient of the derivative of 2x^3 to be 6');
	assert.equal(der.powers[0], 2, 'We expect the power of the derivative of 2x^3 to be 2');
	assert.equal(der.value(), 150, 'We expect the value of the derivative of 2x^3 to be 150 when x = 5');
	
});

module('polynomial tests');

test( "evaluate a simple polynomial", function( assert ) {
	var polynomial_definition = {termDefs:[{coefficient: 2, powers: [0]},{coefficient: 2, powers: [1]}]},
		expected_output = 8,
		fn = new KGMath.Functions.Polynomial(polynomial_definition),
		actual_output = fn.value([3]);
	assert.equal(actual_output, expected_output, 'We expect 2 + 2x to be 8 when x = 3')
});

test( "take the simple derivative of a polynomial", function( assert ) {
	var polynomial_definition = {termDefs:[{coefficient: 2, powers: [0]},{coefficient: 2, powers: [1]}]},
		fn = new KGMath.Functions.Polynomial(polynomial_definition),
		der = fn.derivative(),
		expected_output = 2,
		actual_output = der.value([3]);
	assert.equal(actual_output, expected_output, 'We expect the derivative of 2 + 2x to be 2 when x = 3')
});

module('linear function tests');

test( "linear function tests for a line with positive slope", function( assert ) {
	var si = new KGMath.Functions.SlopeInterceptLine({m: 2, b: 2}),
		ps = new KGMath.Functions.PointSlopeLine({p: {x:1, y:4}, m:2}),
		pp = new KGMath.Functions.TwoPointLine({p1: {x:1, y:4}, p2:{x:2, y:6}});

	var view = new KG.View({
			xAxis: {min:0, max:10},
			yAxis: {min:0, max:10}
		}),
		expected_endpoints = [ { x: 0, y: 2 }, {x: 4, y: 10} ];
		 
	assert.equal(si.value([3,8]), 0, 'We expect the point (3,8) to be along the line with slope 2 and intercept 2.');
	assert.equal(ps.value([3,8]), 0, 'We expect the point (3,8) to be along the line with slope 2 passing through (1,4).');
	assert.equal(pp.value([3,8]), 0, 'We expect the point (3,8) to be along the line passing through (1,4) and (2,6).');
	assert.equal(si.yValue(3), 8, 'We expect y(3) = 8 along the line with slope 2 and intercept 2.');
	assert.equal(ps.yValue(3), 8, 'We expect y(3) = 8 along the line with slope 2 passing through (1,4).');
	assert.equal(pp.yValue(3), 8, 'We expect y(3) = 8 along the line passing through (1,4) and (2,6).');
	assert.equal(si.xValue(8), 3, 'We expect x(8) = 3 along the line with slope 2 and intercept 2.');
	assert.equal(ps.xValue(8), 3, 'We expect x(8) = 3 along the line with slope 2 passing through (1,4).');
	assert.equal(pp.xValue(8), 3, 'We expect x(8) = 3 along the line passing through (1,4) and (2,6).');
	assert.equal(si.slope, 2, 'We expect the slope of the line with slope 2 and intercept 2 to be 2.');
	assert.equal(ps.slope, 2, 'We expect the slope of the line with slope 2 passing through (1,4) to be 2.');
	assert.equal(pp.slope, 2, 'We expect the slope of the line passing through (1,4) and (2,6) to be 2.');
	for(i = 0;i<10;i++) {
		var x = Math.round(Math.random()*100), y = Math.round(Math.random()*100);
		assert.equal(si.value([x,y]), ps.value([x,y]), 'We expect a line defined by slope = 2 and intercept = 2 to have the same value in all points as a line defined by slope = 2 and the point (1,4) - tested with (' + x + ', ' + y + ')');
		assert.equal(si.value([x,y]), pp.value([x,y]), 'We expect a line defined by slope = 2 and intercept = 2 to have the same value in all points as a line defined the points (1,4) and (2,6) - tested with (' + x + ', ' + y + ')');
	}
    assert.deepEqual(pp.points(view), expected_endpoints, 'We expect the endpoints of this line to be (0,2) and (4,10) in the domain [0,10] x [0,10]');

});

test( "linear function tests for a horizontal line", function( assert ) {

	var si = new KGMath.Functions.SlopeInterceptLine({m: 0, b: 2}),
		ps = new KGMath.Functions.PointSlopeLine({p: {x:1, y:2}, m:0}),
		pp = new KGMath.Functions.TwoPointLine({p1: {x:1, y:2}, p2:{x:2, y:2}});

	var view = new KG.View({
			xAxis: {min:0, max:10},
			yAxis: {min:0, max:10}
		}),
		expected_endpoints = [ { x: 0, y: 2 }, {x: 10, y: 2} ];
		 
	assert.equal(si.value([4,2]), 0, 'We expect the point (4,2) to be along the line with slope 0 and intercept 2.');
	assert.equal(ps.value([4,2]), 0, 'We expect the point (4,2) to be along the line with slope 0 passing through (1,2).');
	assert.equal(pp.value([4,2]), 0, 'We expect the point (4,2) to be along the line passing through (1,2) and (2,2).');
	assert.equal(si.yValue(4), 2, 'We expect y(4) = 2 along the line with slope 0 and intercept 2.');
	assert.equal(ps.yValue(4), 2, 'We expect y(4) = 2 along the line with slope 0 passing through (1,2).');
	assert.equal(pp.yValue(4), 2, 'We expect y(4) = 2 along the line passing through (1,2) and (2,2).');
	assert.equal(si.xValue(2), undefined, 'We expect x(2) to be undefined for the line with slope 0 and intercept 2.');
	assert.equal(ps.xValue(2), undefined, 'We expect x(2) to be undefined for the line with slope 0 passing through (1,2).');
	assert.equal(pp.xValue(2), undefined, 'We expect x(2) to be undefined for the line passing through (1,2) and (2,2).');
	assert.equal(si.slope, 0, 'We expect the slope of the line with slope 0 and intercept 2 to be 0.');
	assert.equal(ps.slope, 0, 'We expect the slope of the line with slope 2 passing through (1,2) to be 0.');
	assert.equal(pp.slope, 0, 'We expect the slope of the line passing through (1,2) and (2,2) to be 0.');
	assert.deepEqual(pp.points(view),expected_endpoints, 'We expect the endpoints of this line to be (0,2) and (10,2) in the domain [0,10] x [0,10]');

});

test( "linear function tests for a vertical line", function( assert ) {
	var pp = new KGMath.Functions.TwoPointLine({p1: {x:2, y:1}, p2:{x:2, y:2}});
		 
	var view = new KG.View({
		xAxis: {min:0, max:10},
		yAxis: {min:0, max:10}
		}),
		expected_endpoints = [ { x: 2, y: 0 }, {x: 2, y: 10} ];
		 
	assert.equal(pp.value([2,4]), 0, 'We expect the point (2,4) to be along the line passing through (2,1) and (2,2).');
	assert.equal(pp.yValue(2), undefined, 'We expect y(2) to be undefined for the line passing through (2,1) and (2,2).');
	assert.equal(pp.xValue(4), 2, 'We expect x(4) = 2 along the line passing through (2,1) and (2,2).');
	assert.equal(pp.slope, Infinity, 'We expect the slope of the line passing through (2,1) and (2,2) to be infinite.');
	assert.equal(pp.xIntercept, 2, 'We expect the x intercept of the line passing through (2,1) and (2,2) to be 2.');
	assert.deepEqual(pp.points(view),expected_endpoints, 'We expect the endpoints of this line to be (2,0) and (2,10) in the domain [0,10] x [0,10]');


});

module( "helper tests");

test("average two objects test", function(assert) {
	var a = 3,
		b = 4,
		c = {x: 3, y: 1},
		d = {x: 1, y: 5};

	var abAvg = 3.5,
		cdAvg = {x:2,y:3};

	assert.equal(KG.averageTwoObjects(a,b),abAvg, 'We expect the average of 3 and 4 to be 3.5');
	assert.deepEqual(KG.averageTwoObjects(c,d),cdAvg, 'We expect the average of {x: 3, y: 1} and {x: 1, y: 5} to b {x:2, y:3}');
});

test("average n objects test", function(assert) {
	var a = 3,
		b = 4,
		c = 5,
		d = {x: 3, y: 1},
		e = {x: 1, y: 5},
		f = {x: 5, y: 6}

	var abcAvg = 4,
		defAvg = {x:3,y:4};

	assert.equal(KG.arrayAverage([a,b,c]),abcAvg, 'We expect the average of 3, 4, and 5 to be 4');
	assert.deepEqual(KG.arrayAverage([d,e,f]),defAvg, 'We expect the average of {x: 3, y: 1}, {x: 1, y: 5}, and {x:5, y: 6} to b {x:5, y:6}');
});


/*
module( "utility function tests");

test( "cobb douglas utility function", function(assert) {

	var cd = new econgraphs.functions.utility.CobbDouglas();

	assert.equal(cd.value([4,25]),10,'We expect the value of u(x,y) = (x^0.5)(y^0.5) to be 10 at the point (4,25).');
	assert.equal(cd.mux([4,25]),5/4,'We expect the MUx of u(x,y) = (x^0.5)(y^0.5) to be 5/4 at the point (4,25).');
	assert.equal(cd.muy([4,25]),1/5,'We expect the MUy of u(x,y) = (x^0.5)(y^0.5) to be 1/5 at the point (4,25).');
	assert.equal(cd.mrs([4,25]),25/4,'We expect the MRS of u(x,y) = (x^0.5)(y^0.5) to be 25/4 at the point (4,25).');

	cd.setLevel(cd.value([4,25]));
	assert.equal(cd.yValue(25),4, 'We expect the value of y to be 4 when x = 25 along the indifference curve u(x,y) = (x^0.5)(y^0.5) = 10');
	assert.equal(cd.yValue(100),1, 'We expect the value of y to be 100 when x = 1 along the indifference curve u(x,y) = (x^0.5)(y^0.5) = 10');

    assert.deepEqual(cd.optimalBundle(12,3,6),[2,1], 'We expect the optimal bundle to be (2,1) when I = 12, px = 3, py = 6');
    assert.close(cd.lowestCostBundle(10, 25, 4)[0], 4, 0.01, 'We expect the lowest cost bundle to achieve U = 10 to have x=4 when px=25 and py=4');
    assert.close(cd.lowestCostBundle(10, 25, 4)[1], 25, 0.01, 'We expect the lowest cost bundle to achieve U = 10 to have y=25 when px=25 and py=4');

    cd.setBudgetConstraint({income: 36, prices: [4.5, 2]});
    assert.deepEqual(cd.optimalBundle(), [4,9], 'We expect the optimal bundle to be (4,9) when I = 36, px = 4.5, py = 2, set beforehand');
    assert.close(cd.lowestPossibleCost(6),36, 0.01, 'We expect 6 units of utility to cost $36 when px = 4.5 and py = 2.');
    assert.close(cd.indirectUtility(36), 6, 0.01, 'We expect the indirect utility of having $36 to be 6 when px = 4.5, py = 2 (and therefore x=4, y=9).');


});

test( "perfect complements utility function", function(assert) {

	var pc = new econgraphs.functions.utility.PerfectComplements({ a: 1, b: 2});

    var xDomain = {min: 0, max: 10},
        yDomain = {min: 0, max: 10},
        expected_endpoints = [
            {x: 4, y: 10},
            {x: 4, y: 2},
            {x: 10, y: 2}
        ];

    assert.equal(pc.value([5,5]),5,'We expect the value of u(x,y) = min(x,2y) to be 5 at the point (5,5).');
	assert.equal(pc.mux([5,5]),1,'We expect the MUx of u(x,y) = min(x,2y) to be 1 at the point (5,5).');
	assert.equal(pc.muy([5,5]),0,'We expect the MUy of u(x,y) = min(x,2y) to be 0 at the point (5,5).');
	assert.equal(pc.mrs([5,5]),'undefined','We expect the MRS of u(x,y) = min(x,2y) to be undefined at the point (5,5).');

	assert.equal(pc.value([5,1]),2,'We expect the value of u(x,y) = min(x,2y) to be 2 at the point (5,1).');
	assert.equal(pc.mux([5,1]),0,'We expect the MUx of u(x,y) = min(x,2y) to be 0 at the point (5,1).');
	assert.equal(pc.muy([5,1]),2,'We expect the MUy of u(x,y) = min(x,2y) to be 2 at the point (5,1).');
	assert.equal(pc.mrs([5,1]),0,'We expect the MRS of u(x,y) = min(x,2y) to be 0 at the point (5,1).');

    assert.equal(pc.value([2, 1]), 2, 'We expect the value of u(x,y) = min(x,2y) to be 2 at the point (2,1).');
    assert.equal(pc.mux([2, 1]), 0, 'We expect the MUx of u(x,y) = min(x,2y) to be 0 at the point (2,1).');
    assert.equal(pc.muy([2, 1]), 0, 'We expect the MUy of u(x,y) = min(x,2y) to be 0 at the point (2,1).');
    assert.equal(pc.mrs([2, 1]), 'undefined', 'We expect the MRS of u(x,y) = min(x,2y) to be undefined at the point (2,1).');

    pc.setLevel(4);
	assert.equal(pc.yValue(10),2, 'We expect the value of y to be 2 when x = 10 along the indifference curve u(x,y) = min(x,2y) = 4');
	assert.equal(pc.xValue(10),4, 'We expect the value of x to be 4 when y = 10 along the indifference curve u(x,y) = min(x,2y) = 4');
    assert.deepEqual(pc.points(xDomain, yDomain), expected_endpoints, 'We expect the endpoints of this indifference curve to be (4,10), (4,2) and (10,2) in the domain [0,10] x [0,10]');

    assert.deepEqual(pc.optimalBundle(20, 3, 4), [4,2], 'We expect the optimal bundle to be (4,2) when I = 20, px = 3, py = 4');
    assert.close(pc.lowestCostBundle(4, 3, 4)[0], 4, 0.01, 'We expect the lowest cost bundle to achieve U = 4 to have x=4 when px=3 and py=4');
    assert.close(pc.lowestCostBundle(4, 3, 4)[1], 2, 0.01, 'We expect the lowest cost bundle to achieve U = 4 to have y=2 when px=3 and py=4');

    pc.setBudgetConstraint({income: 40, prices: [3, 4]});
    assert.deepEqual(pc.optimalBundle(), [8,4], 'We expect the optimal bundle to be (8,4) when I = 40, px = 3, py = 4, set beforehand');
    assert.close(pc.lowestPossibleCost(4), 20, 0.01, 'We expect 4 units of utility to cost $20 when px=3 and py=4.')
    assert.close(pc.indirectUtility(20), 4, 0.01, 'We expect the indirect utility of having $20 to be 4 when px = 3 and py = 4 (and therefore x=4, y=2).');

});

test("perfect substitutes utility function", function (assert) {

    var ps = new econgraphs.functions.utility.PerfectSubstitutes({ a: 1, b: 2});

    var xDomain = {min: 0, max: 15},
        yDomain = {min: 0, max: 15},
        expected_endpoints = [
            {x: 12, y: 0},
            {x: 0, y: 6}

        ];

    assert.equal(ps.value([2, 5]), 12, 'We expect the value of u(x,y) = x + 2y to be 12 at the point (2,5).');
    assert.equal(ps.mux([2, 5]), 1, 'We expect the MUx of u(x,y) = x + 2y to be 1 at the point (5,5).');
    assert.equal(ps.muy([2, 5]), 2, 'We expect the MUy of u(x,y) = x + 2y to be 2 at the point (5,5).');
    assert.equal(ps.mrs([2, 5]), 0.5, 'We expect the MRS of u(x,y) = x + 2y to be 0.5 at the point (5,5).');

    ps.setLevel(12);
    assert.equal(ps.yValue(4),4, 'We expect the value of y to be 4 when x = 4 along the indifference curve u(x,y) = x + 2y = 12')
    assert.equal(ps.xValue(1),10, 'We expect the value of x to be 10 when y = 1 along the indifference curve u(x,y) = x + 2y = 12')
    assert.deepEqual(ps.points(xDomain, yDomain), expected_endpoints, 'We expect the endpoints of this indifference curve to be (0,6) and (12,0) in the domain [0,15] x [0,15]');

    assert.deepEqual(ps.optimalBundle(24, 3, 4), [0,6], 'We expect the optimal bundle to be (0,6) when I = 24, px = 3, py = 4');
    assert.deepEqual(ps.optimalBundle(24, 3, 10), [8,0], 'We expect the optimal bundle to be (8,0) when I = 24, px = 3,  py = 10');
    assert.deepEqual(ps.optimalBundle(24, 3, 6), [4, 2], 'We expect the optimal bundle to be (4,2) - chosen arbitrarily as the midpoint - when I = 24, px = 3,  py = 6');

    ps.setBudgetConstraint({income: 40, prices: [3, 4]});
    assert.deepEqual(ps.optimalBundle(), [0, 10], 'We expect the optimal bundle to be (0,10) when I = 40, px = 3, py = 4, set beforehand');
    assert.close(ps.lowestPossibleCost(12), 24, 0.01, 'We expect 12 units of utility to cost $24 when px=3 and py=4.');
    assert.close(ps.indirectUtility(20), 10, 0.01, 'We expect the indirect utility of having $20 to be 10 when px = 3 and py = 4 (and therefore x=0, y=5).');

});

*/