/// <reference path="../kg.ts"/>
/// <reference path="helpers.ts"/>
/// <reference path="axis.ts"/>
/// <reference path="graphObject.ts"/>
/// <reference path="point.ts"/>


module KineticGraphs
{

    // Additions to the scope of a graph
    export interface IGraphScope extends ng.IScope
    {
        // Dimensions of the graph
        element: HTMLElement;

        // Axis information
        xAxis: IAxis;
        yAxis: IAxis;

        // Semantic Objects
        // (these generate D3 objects, which are then rendered)
        graphObjects: IGraphObject[];

        // D3 Objects
        vis: D3.Selection;
        renderedObjects: IRenderedObjects;

        // D3 Scales
        x: D3.Scale.LinearScale;
        y: D3.Scale.LinearScale;

        // Other D3 Helpers
        curveFunction: D3.Svg.Line;
        verticalArea: D3.Svg.Area;
        horizontalArea: D3.Svg.Area;

        // Draw graph
        drawGraph: () => void;
        drawObjects: () => void;

    }

    // Methods that may be called on a graph
    export interface IGraphController
    {
        addObject: (graphObject: IGraphObject) => void;
        addAxis: (axis: IAxis) => void;
        drawGraph: () => void;
    }

    // Implementation of graph methods
    export class GraphController implements IGraphController
    {

        constructor(public $scope:IGraphScope) {

            $scope.graphObjects = [];
            $scope.renderedObjects = new RenderedObjects();

            $scope.drawObjects = function() {
                $scope.graphObjects.forEach(function(graphObject) { $scope = graphObject.render($scope)})
            };

            $scope.drawGraph = function() {

                if($scope.xAxis && $scope.yAxis && $scope.element) {

                    // Remove existing graph if already drawn
                    if ($scope.vis) {
                        d3.select($scope.element).select('svg').remove();
                        d3.select($scope.element).selectAll('div').remove();
                    }

                    // Get attributes of <graph> element
                    var element = $scope.element,
                        attributes:NamedNodeMap = element.attributes;

                    // Establish default dimensions of graph
                    var elementDimensions: IDimensions = {width: element.parentElement.clientWidth, height: 500},
                        margin: IMargins = {top: 20, left: 100, bottom: 100, right: 20};

                    // Override with given attributes if they exist
                    if(attributes.hasOwnProperty('height')) {
                        elementDimensions.height = +attributes['height'].value;
                    }
                    if(attributes.hasOwnProperty('width')) {
                        elementDimensions.width = Math.min(attributes['width'].value, elementDimensions.width);
                    }

                    // Establish inner dimensions of graph (element dimensions minus margins)
                    var graphDimensions: IDimensions = {
                        width: elementDimensions.width - margin.left - margin.right,
                        height: elementDimensions.height - margin.top - margin.bottom
                    };

                    // Create D3 SVG
                    $scope.vis = d3.select($scope.element)
                        .append("svg")
                        .attr("width", elementDimensions.width)
                        .attr("height", elementDimensions.height)
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                    // Establish scales

                    var xDomain:IRange = $scope.xAxis.domain,
                        yDomain:IRange = $scope.yAxis.domain;

                    $scope.x = d3.scale.linear()
                        .range([0, graphDimensions.width])
                        .domain([xDomain.min,xDomain.max]);

                    $scope.y = d3.scale.linear()
                        .range([graphDimensions.height, 0])
                        .domain([yDomain.min,yDomain.max]);

                    // Establish D3 selectors for rendered object types
                    $scope.renderedObjects.select($scope.vis);

                    var x_axis = $scope.vis.append('g').attr('class', 'x axis').attr("transform", "translate(0," + graphDimensions.height + ")");
                    var y_axis = $scope.vis.append('g').attr('class', 'y axis');

                    var x_axis_label = x_axis.append("text")
                        .attr("x", graphDimensions.width / 2)
                        .attr("y", "4em")
                        .style("text-anchor", "middle");

                    var y_axis_label = y_axis.append("text")
                        .attr("transform", "rotate(-90)")
                        .attr("x", -graphDimensions.height / 2)
                        .attr("y", "-4em")
                        .style("text-anchor", "middle");

                    // Add x axis
                    x_axis.call(d3.svg.axis().scale($scope.x).orient("bottom").ticks($scope.xAxis.ticks));
                    x_axis_label.text($scope.xAxis.title);

                    // Add y axis
                    y_axis.call(d3.svg.axis().scale($scope.y).orient("left").ticks($scope.yAxis.ticks));
                    y_axis_label.text($scope.yAxis.title);

                    $scope.drawObjects();

                }

            };

        }

        // add an object to the array of graph objects
        addObject = function(newObject:IGraphObject) {
            this.$scope.graphObjects.push(newObject);
        };

        // define axis elements for the graph
        // and create the D3 scales for the x and y dimensions
        addAxis = function(axis:IAxis) {
            var name:string = axis.dim === 'x' ? 'xAxis' : 'yAxis';
            this.$scope[name] = axis;
            this.$scope.drawGraph();
        };

        // expose API to draw graph
        drawGraph = this.$scope.drawGraph;

        curveFunction = d3.svg.line()
            .x(function (d) {
                return this.x(d.x);
            }).y(function (d) {
                return this.y(d.y);
            }).interpolate("linear");

        verticalArea = d3.svg.area()
            .x(function (d) {
                return this.x(d.x);
            })
            .y0(function (d) {
                return this.y(d.y0);
            })
            .y1(function (d) {
                return this.y(d.y1);
            });

        horizontalArea = d3.svg.area()
            .x0(function (d) {
                return this.x(d.x0);
            })
            .x1(function (d) {
                return this.x(d.x1);
            })
            .y(function (d) {
                return this.y(d.y);
            });

    }

    // Creation of graph from element and children
    export function Graph(): ng.IDirective {

        function link(scope: IGraphScope, element:JQuery) {
            scope.element = element[0];
            scope.drawGraph();
        }

        return {
            restrict: 'E',
            transclude: true,
            template: "<div><div ng-transclude/></div>",
            link: link,
            controller: GraphController
        }
    }

}

