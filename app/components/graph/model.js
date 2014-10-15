/**
 * Created by cmakler on 9/18/14.
 */

'use strict';

angular.module('kineticGraphs.model', [])

    .directive('model', function () {

        function controller($scope, $window) {

            $scope.params = {
                px: 3,
                py: 4,
                income: 60,
                alpha: 0.5,
                beta: 0.5
            };

            $scope.sliders = {
                px: {name: 'Px', label: 'Px', min: 1, max: 6, precision: 0.05},
                py: {name: 'Py', label: 'Py', min: 1, max: 6, precision: 0.05},
                income: {name: 'I', label: 'Income', min: 24, max: 60, precision: 1},
                alpha: {name: 'a', label: 'a', min: 0, max: 1, precision: 0.05},
                beta: {name: 'b', label: 'b', min:0, max: 1, precision: 0.05}
            };

            $scope.graphs = [

                {
                    x_axis: {title: "Good X", min: 0, max: 60, ticks: 10},
                    y_axis: {title: "Good Y", min: 0, max: 60, ticks: 10},
                    dimensions: {width: 600, height: 600},
                    functions: {
                        budget_constraint: {
                            functionType: 'budgetConstraint',
                            px: 'px',
                            py: 'py',
                            income: 'income'
                        },
                        indifference_curve: {
                            functionType: 'optimalCobbDouglassIndifferenceCurve',
                            alpha: 'alpha',
                            beta: 'beta',
                            px: 'px',
                            py: 'py',
                            income: 'income'
                        },
                        suboptimal_indifference_curve: {
                            functionType: 'cobbDouglassIndifferenceCurve',
                            alpha: 'alpha',
                            beta: 'beta',
                            point: {x: 10, y: 10}
                        },
                        optimal_bundle: {
                            functionType: 'optimalCobbDouglassBundle',
                            alpha: 'alpha',
                            beta: 'beta',
                            px: 'px',
                            py: 'py',
                            income: 'income'
                        }
                    },
                    objects: [
                        {type: 'function', functionName: 'indifference_curve', color: 'green', fill: 'lightgreen', fillPoint: {x: 60, y: 60}},
                        {type: 'function', functionName: 'suboptimal_indifference_curve', color: 'green', fill: 'lightgreen', fillPoint: {x: 60, y: 60}},
                        {type: 'function', functionName: 'budget_constraint', color: 'blue', fill: 'lightblue', fillPoint: {x: 0, y: 0}},
                        {type: 'point', functionName: 'optimal_bundle', droplines: 'both', xLabel: 'X*', yLabel: 'Y*'}
                    ]
                }
            ];



            angular.element($window).on('resize', function () {
                $scope.$apply()
            });

        }

        return {
            restrict: 'E',
            controller: controller,
            replace: true,
            templateUrl: 'components/graph/model.html'
        }

    })

    .directive('slider', function () {

        function link(scope, el) {
            el = el[0];

            var raw_value = scope.value // needed to help smoothe slider motion

            var width = 150,
                height = 40,
                radius = height / 2,
                innerWidth = width - height;

            function position(x) {
                return radius + innerWidth * (x - scope.min) / (scope.max - scope.min)
            }

            function positionDelta(dx) {
                return dx * (scope.max - scope.min) / innerWidth
            }

            var svg = d3.select(el).append('svg')
                .attr({width: width, height: 2 * radius});

            scope.$watch('value', function (value) {
                circle.attr({cx: position(value)});
            });

            var drag = d3.behavior.drag()
                .on("dragstart", function () {
                    this.parentNode.appendChild(this);
                    d3.select(this).transition()
                        .ease("elastic")
                        .duration(500)
                        .attr("r", radius * 0.8);
                })
                .on("drag", function () {
                    var dragPosition = parseFloat(raw_value) + positionDelta(d3.event.dx);
                    raw_value = Math.max(scope.min, Math.min(scope.max, dragPosition));
                    scope.value = Math.round(raw_value/parseFloat(scope.precision))*scope.precision;
                    scope.$apply();
                })
                .on("dragend", function () {
                    d3.select(this).transition()
                        .ease("elastic")
                        .duration(500)
                        .attr("r", radius * 0.7);
                });

            // Draw slider line
            svg.append('line').attr({x1: radius, x2: radius + innerWidth, y1: radius, y2: radius, stroke: 'blue', strokeWidth: 1});

            // Draw slider control circle
            var circle = svg.append('circle')
                .attr({cy: radius, r: radius * 0.7 })
                .call(drag);

        }

        return {
            link: link,
            restrict: 'E',
            scope: { value: '=', min: '=', max: '=', precision: '=' }
        };
    })

    .directive('graph', function () {

        function link(scope, el) {
            el = el[0];

            var graph_data = scope.data;

            if (!graph_data) {
                return;
            }

            var x_axis = graph_data.x_axis || {min: 0, max: 10, title: ''},
                y_axis = graph_data.y_axis || {min: 0, max: 10, title: ''},
                dimensions = graph_data.dimensions || {height: 500, width: 700},
                margin = graph_data.margin || {top: 10, right: 30, bottom: 70, left: 70};

            var x_axis_domain = [x_axis.min || 0, x_axis.max || 10],
                y_axis_domain = [y_axis.min || 0, y_axis.max || 10];

            var graph_width, graph_height, x, y, circles, lines, curves, labels;

            scope.$watchCollection('params', drawObjects);
            scope.$watch(function () { return el.parentElement.clientWidth }, resize);

            // This contains all the logic for converting user-defined objects into D3 objects to be plotted
            scope.plotted_shapes = function(params) {

                var object_definitions = graph_data.objects;

                // reset plotted shapes
                var plotted_shapes = {'circles' : [], 'lines': [], 'curves': [], 'labels': []};

                var plot_as_points = d3.set(['point','dot']),
                    plot_as_lines = d3.set(['line','segment']),
                    plot_as_curves = d3.set(['function','linear']);

                function paramValue(d) {
                    if (typeof d == 'string') {
                        return params[d];
                    } else if (d instanceof Array) {
                        return d.map(function(x) { return paramValue(x)})
                    } else if (d instanceof Object) {
                        var response = {};
                        for (var key in d) {
                            if (d.hasOwnProperty(key)) {
                                response[key] = paramValue(d[key])
                            }
                        }
                        return response;
                    } else {
                        return d;
                    }
                }


                function xCoord(d) {
                    return x(paramValue(d.x))
                }

                function yCoord(d) {
                    return y(paramValue(d.y))
                }

                function pointInPlottedArea(point) {
                    return (point.x >= x_axis.min && point.x <= x_axis.max && point.y >= y_axis.min && point.y <= y_axis.max)
                }

                // TODO this is fragile, assumes way too much
                function namedFunction(name) {
                    var f = graph_data.functions[name];
                    return new KineticGraphFunction(f.functionType, paramValue(f));
                    /*
                    return
                    if (f.functionType == 'linear') {
                        return linearFunction(paramValue(f.slope), paramValue(f.intercept), f.options);
                    }
                    if (f.functionType == 'polynomial') {
                        return polynomialFunction(paramValue(f.coefficients), f.options);
                    }
                    if (f.functionType == 'logLinearContourFunction') {
                        return logLinearContourFunction(paramValue(f.alpha), paramValue(f.beta), paramValue(f.point));
                    }
                    if (f.functionType == 'linearContourFunction') {
                        return linearContourFunction(paramValue(f.alpha), paramValue(f.beta), paramValue(f.point));
                    }
                    if (f.functionType == 'cobbDouglassIndifferenceCurve') {
                        return cobbDouglassIndifferenceCurve(paramValue(f.alpha), paramValue(f.beta), paramValue(f.point));
                    }
                    if (f.functionType == 'budgetConstraint') {
                        return budgetConstraint(paramValue(f.px), paramValue(f.py), paramValue(f.income));
                    }
                    if (f.functionType == 'optimalCobbDouglassBundle') {
                        return optimalCobbDouglassBundle(paramValue(f.alpha), paramValue(f.beta), paramValue(f.px), paramValue(f.py), paramValue(f.income));
                    }
                    if (f.functionType == 'optimalCobbDouglassIndifferenceCurve') {
                        return optimalCobbDouglassIndifferenceCurve(paramValue(f.alpha), paramValue(f.beta), paramValue(f.px), paramValue(f.py), paramValue(f.income));
                    }*/
                }

                function pointCoordinates(functionName, inputValue) {
                    var fn = namedFunction(functionName);
                    if(inputValue) {
                        return fn(paramValue(inputValue));
                    } else {
                        return fn;
                    }
                }

                function curvePoints(functionDefinition, options) {

                    var curve = [];

                    var domain_min, domain_max, step;

                    if (options && options.yIndependent) {
                        domain_min = y_axis.min;
                        domain_max = y_axis.max;

                    } else {
                        domain_min = x_axis.min;
                        domain_max = x_axis.max;
                    }

                    step = (domain_max - domain_min) / graph_width;

                    for (var dep = domain_min; dep < domain_max; dep += step) {
                        var point = functionDefinition(dep);
                        if (pointInPlottedArea(point)) {
                            curve.push(point)
                        } else {
                            // If this curve is off the plotted area, but an adjacent curve is in the plotted area,
                            // add the point which is directly on the boundary of the plotted area
                            var adjacent_point;

                            if (pointInPlottedArea(functionDefinition(dep - step))) {
                                adjacent_point = functionDefinition(dep - step);
                            } else if (pointInPlottedArea(functionDefinition(dep + step))) {
                                adjacent_point = functionDefinition(dep + step);
                            } else continue;

                            var edge_point = {};
                            // Now figure out which way out of the plotted area this is
                            if (point.x < x_axis.min) {

                                edge_point.x = x_axis.min;
                                edge_point.y = adjacent_point.y + (point.y - adjacent_point.y) * (x_axis.min - adjacent_point.x)/(point.x - adjacent_point.x)

                            } else if(point.x > x_axis.max) {

                                edge_point.x = x_axis.max;
                                edge_point.y = adjacent_point.y + (point.y - adjacent_point.y) * (x_axis.max - adjacent_point.x) / (point.x - adjacent_point.x)

                            } else if (point.y < y_axis.min) {

                                edge_point.x = adjacent_point.x + (point.x - adjacent_point.x) * (y_axis.min - adjacent_point.y) / (point.y - adjacent_point.y)
                                edge_point.y = y_axis.min;

                            } else if (point.y > y_axis.max) {

                                edge_point.x = adjacent_point.x + (point.x - adjacent_point.x) * (y_axis.max - adjacent_point.y) / (point.y - adjacent_point.y)
                                edge_point.y = y_axis.max;

                            }

                            curve.push(edge_point);


                        }

                    }

                    return curve;
                }


                object_definitions.forEach(function(object_definition) {

                    object_definition = d3.map(object_definition);

                    var object_type = object_definition.get('type');

                    function pointOnGraph(point) {
                        return (point.x >= 0 && point.x <= graph_width && point.y >= 0 && point.y <= graph_height)
                    }

                    // Add shapes for plotting point
                    if(plot_as_points.has(object_type)) {

                        var cx, cy;

                        // Get plotted values of x and y if x and y are given explicitly

                        if (object_definition.has('x') && object_definition.has('y')) {
                            cx = x(paramValue(object_definition.get('x')));
                            cy = y(paramValue(object_definition.get('y')));
                        }

                        // Get plotted values of x and y if the point (x,y) is the result of a function

                        if (object_definition.has('functionName')) {
                            var pointCoords = pointCoordinates(object_definition.get('functionName'), object_definition.get('inputValue'));
                            cx = xCoord(pointCoords);
                            cy = yCoord(pointCoords);
                        }

                        // Add point and associated droplines and labels only if the point is on the domain of the graph

                        var object_class = object_definition.get('class') || '';

                        if (pointOnGraph({x: cx, y: cy})) {
                            plotted_shapes.circles.push({class: object_class, cx: cx, cy: cy});
                            console.log('plotted point cx is ' + cx)

                            if(object_definition.has('droplines')) {

                                // Add a vertical dropline unless droplines == horizontal
                                if(object_definition.get('droplines') != 'horizontal') {
                                    plotted_shapes.lines.push({class: object_class + ' dropline', x1: cx, y1: cy, x2: cx, y2: graph_height + 25});
                                    if(object_definition.get('xLabel')){
                                        plotted_shapes.labels.push({text: object_definition.get('xLabel'), x: cx, y: graph_height + 40, anchor:'middle'})
                                    }
                                }

                                // Add a horizontal dropline unless droplines == vertical
                                if (object_definition.get('droplines') != 'vertical') {
                                    plotted_shapes.lines.push({class: object_class + ' dropline', x1: cx, y1: cy, x2: -25, y2: cy});
                                    if (object_definition.get('yLabel')) {
                                        plotted_shapes.labels.push({text: object_definition.get('yLabel'), x: -40, y: cy + 5, anchor: 'right'})
                                    }
                                }

                            }
                        }

                    }

                    // Add shapes for plotting line
                    if(plot_as_lines.has(object_type)) {

                    }

                    // Add shapes for plotting curve
                    if(plot_as_curves.has(object_type)) {

                        if (object_definition.has('functionName')) {

                            var curveFunction = d3.svg.line()
                                .x(function (d) {
                                    return x(d.x);
                                }).y(function (d) {
                                    return y(d.y);
                                }).interpolate("linear");

                            var n = object_definition.get('functionName');
                            var c = curvePoints(namedFunction(n), graph_data.functions[n].options);
                            if(object_definition.get('fill') && object_definition.get('fillPoint')) {
                                var fc = c.slice(0); // copy curve definition so we can append a value without altering the original
                                fc.push(paramValue(object_definition.get('fillPoint')));
                                plotted_shapes.curves.push({points: curveFunction(fc), color: 'none', fill: object_definition.get('fill')});
                            }
                            plotted_shapes.curves.push({points: curveFunction(c), color: object_definition.get('color'), fill: 'none'});
                        }

                    }

                });

                //console.log('plotted shapes are now ' + JSON.stringify(plotted_shapes))
                return plotted_shapes;

            };

            function drawObjects() {

                var data = scope.plotted_shapes(scope.params);

                lines = lines.data(data.lines);
                lines.exit().remove();
                lines.enter().append('line')
                    .attr('stroke-width',2)
                    .attr('stroke','red');
                lines
                    .attr('x1', function (d) {
                        return d.x1
                    })
                    .attr('y1', function (d) {
                        return d.y1
                    })
                    .attr('x2', function (d) {
                        return d.x2
                    })
                    .attr('y2', function (d) {
                        return d.y2
                    });

                curves = curves.data(data.curves);
                curves.exit().remove();
                curves.enter().append('svg:path')
                    .attr('stroke-width',2)
                    .attr('stroke',function(d) {
                        return d.color
                    })
                    .attr('fill',function(d) {
                        return d.fill
                    })
                    .attr('fill-opacity',0.5);
                curves.attr('d',function(d) {return d.points})

                circles = circles.data(data.circles);
                circles.exit().remove();
                circles.enter().append('circle').attr('r', 5);
                circles
                    .attr('cx', function (d) {
                        return d.cx
                    })
                    .attr('cy', function (d) {
                        return d.cy
                    });

                labels = labels.data(data.labels);
                labels.exit().remove();
                labels.enter().append("svg:text");
                labels
                    .attr("x", function (d) {
                        return d.x
                    })
                    .attr("y", function (d) {
                        return d.y
                    })
                    .attr("text-anchor", function (d) {
                        return d.anchor
                    })
                    .attr("font-size", 14)
                    .attr("font-style", "oblique")
                    .text(function (d) {
                        return d.text
                    });




            }


            function resize() {
                if (scope.vis) {
                    d3.select(el).select('svg').remove();
                    drawGraph()
                }
            }

            function drawGraph() {

                // The width and height of the drawn graph are the width and height of the alloted space, minus the margins.
                graph_width = el.parentElement.clientWidth - margin.left - margin.right;
                graph_height = dimensions.height - margin.top - margin.bottom;

                // Create the D3 scales for the x and y dimensions
                x = d3.scale.linear()
                    .range([0, graph_width])
                    .domain(x_axis_domain);
                y = d3.scale.linear()
                    .range([graph_height, 0])
                    .domain(y_axis_domain);

                // Create the D3 visualization object
                scope.vis = d3.select(el)
                    .append("svg")
                    .attr("width", el.parentElement.clientWidth)
                    .attr("height", dimensions.height)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                // Add x axis
                scope.vis.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + graph_height + ")")
                    .call(d3.svg.axis().scale(x).orient("bottom"))

                    // Label x axis
                    .append("text")
                    .attr("x", graph_width / 2)
                    .attr("y", "4em")
                    .style("text-anchor", "middle")
                    .text(x_axis.title);

                // Add y axis
                scope.vis.append("g")
                    .attr("class", "y axis")
                    .call(d3.svg.axis().scale(y).orient("left"))

                    // Label y axis
                    .append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("x", -graph_height / 2)
                    .attr("y", "-4em")
                    .style("text-anchor", "middle")
                    .text(y_axis.title);

                curves = scope.vis.append('g').attr('class', 'graph-objects').selectAll('g.curve');
                lines = scope.vis.append('g').attr('class', 'graph-objects').selectAll('g.line');
                circles = scope.vis.append('g').attr('class', 'graph-objects').selectAll('g.circle');
                labels = scope.vis.append('g').attr('class', 'graph-objects').selectAll('g.text');

                drawObjects();
            }

            drawGraph();

        }

        return {
            link: link,
            restrict: 'E',
            scope: {data: '=', params: '='}
        }

    });