/**
 * Created by cmakler on 9/18/14.
 */

'use strict';

angular.module('kineticGraphs.model', [])

    .directive('model', function () {

        function controller($scope, $window) {

            $scope.params = {
                price: 10,
                quantity: 20
            };

            $scope.sliders = {
                price: {name: 'P', label: 'Price', min: 5, max: 55}
            };

            $scope.graphs = [
                {
                    x_axis: {title: "Quantity", min: 0, max: 100, ticks: 10},
                    y_axis: {title: "Price", min: 0, max: 60, ticks: 5},
                    functions: {
                        demand: {functionType: 'linear-function', slope: -1, intercept: 30, options: {yIndependent: true, reverseAxes: true, minZero: true}}
                    },
                    objects: [
                        {type: 'point', functionName: 'demand', inputValue: 'price', droplines: 'both'},
                        {type: 'function', functionName: 'demand'}
                    ]
                },
                {
                    x_axis: {title: "Quantity", min: 0, max: 20, ticks: 10},
                    y_axis: {title: "Price", min: 0, max: 60, ticks: 5},
                    objects: [
                        {type: 'dot', x: 'quantity', y: 'price', droplines: 'vertical'}
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
                    var dragPosition = parseFloat(scope.value) + positionDelta(d3.event.dx);
                    scope.value = Math.max(scope.min, Math.min(scope.max, dragPosition));
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
            scope: { value: '=', min: '=', max: '=' }
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

            var graph_width, graph_height, x, y, circles, lines, curves;

            scope.$watchCollection('params', drawObjects);
            scope.$watch(function () { return el.parentElement.clientWidth }, resize);

            // This contains all the logic for converting user-defined objects into D3 objects to be plotted
            scope.plotted_shapes = function(params) {

                var object_definitions = graph_data.objects;

                // reset plotted shapes
                var plotted_shapes = {'circles' : [], 'lines': [], 'curves': []};

                var plot_as_points = d3.set(['point','dot']),
                    plot_as_lines = d3.set(['line','segment']),
                    plot_as_curves = d3.set(['function','linear-function']);

                function paramValue(d) {
                    if (typeof d == 'string') {
                        return params[d];
                    } else {
                        return d;
                    }
                }

                function coord(d, scale) {
                    return scale(paramValue(d))
                }

                function xCoord(d) {
                    return coord(d.x, x)
                }

                function yCoord(d) {
                    return coord(d.y, y)
                }

                function pointInPlottedArea(point) {
                    return (point.x >= x_axis.min && point.x <= x_axis.max && point.y >= y_axis.min && point.y <= y_axis.max)
                }

                function pointOnGraph(point) {
                    return (point.x >= 0 && point.x <= graph_width && point.y >= 0 && point.y <= graph_height)
                }

                // TODO this is fragile, assumes way too much
                function namedFunction(name) {
                    var f = graph_data.functions[name];
                    if (f.functionType == 'linear-function') {
                        return linearFunction(f.slope, f.intercept, f.options);
                    }
                }

                function pointCoordinates(functionName, inputValue) {
                    var dep = paramValue(inputValue);
                    var fn = namedFunction(functionName);
                    return fn(dep);
                }

                function curvePoints(functionDefinition) {

                    function addPointToCurve(point, curve) {
                        if (pointInPlottedArea(point)) {
                            curve.push(point);
                        }
                        return curve;
                    }

                    var curve = [];

                    if (functionDefinition.functionType == 'linear-function') {
                        var m = paramValue(functionDefinition.slope),
                            b = paramValue(functionDefinition.intercept);

                        curve = addPointToCurve({x: x_axis.min, y: b + m * x_axis.min}, curve);    // left intercept
                        curve = addPointToCurve({x: (y_axis.max - b) / m, y: y_axis.max}, curve);  // top intercept
                        curve = addPointToCurve({x: x_axis.max, y: b + m * x_axis.max}, curve);    // right intercept
                        curve = addPointToCurve({x: (y_axis.min - b) / m, y: y_axis.min}, curve);  // bottom intercept

                    } else {
                        for (var dep = x_axis.min; dep < x_axis.max; dep += (x_axis.max - x_axis.min) * 0.01) {
                            var point = functionDefinition(dep);
                            if (pointInPlottedArea(point)) {
                                curve.push(point)
                            }
                        }
                    }

                    var curveFunction = d3.svg.line()
                        .x(function (d) {
                            return x(d.x);
                        }).y(function (d) {
                            return y(d.y);
                        }).interpolate("linear");

                    return curveFunction(curve);
                }


                object_definitions.forEach(function(object_definition) {

                    object_definition = d3.map(object_definition);

                    var object_type = object_definition.get('type');

                    // Add shapes for plotting point
                    if(plot_as_points.has(object_type)) {

                        var cx, cy;

                        // Get plotted values of x and y if x and y are given explicitly

                        if (object_definition.has('x') && object_definition.has('y')) {
                            cx = x(paramValue(object_definition.get('x')));
                            cy = y(paramValue(object_definition.get('y')));
                        }

                        // Get plotted values of x and y if the point (x,y) is the result of a function

                        if (object_definition.has('functionName') && object_definition.has('inputValue')) {
                            var pointCoords = pointCoordinates(object_definition.get('functionName'), object_definition.get('inputValue'));
                            cx = xCoord(pointCoords);
                            cy = yCoord(pointCoords);
                        }

                        // Add point and associated droplines and labels only if the point is on the domain of the graph

                        var object_class = object_definition.get('class') || '';

                        if (pointOnGraph({x: cx, y: cy})) {
                            plotted_shapes.circles.push({shape: 'circle', class: object_class, cx: cx, cy: cy});
                            console.log('plotted point cx is ' + cx)

                            if(object_definition.has('droplines')) {

                                // Add a vertical dropline unless droplines == horizontal
                                if(object_definition.get('droplines') != 'horizontal') {
                                    plotted_shapes.lines.push({shape: 'line', class: object_class + ' dropline', x1: cx, y1: cy, x2: cx, y2: graph_height + 25});
                                }

                                // Add a horizontal dropline unless droplines == vertical
                                if (object_definition.get('droplines') != 'vertical') {
                                    plotted_shapes.lines.push({shape: 'line', class: object_class + ' dropline', x1: cx, y1: cy, x2: -25, y2: cy});
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
                            plotted_shapes.curves.push(curvePoints(namedFunction(object_definition.get('functionName'))));
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
                    .attr('stroke','green')
                    .attr('fill','none');
                curves.attr('d',function(d) {return d})

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