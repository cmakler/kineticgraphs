module KineticGraphs
{
    export function sliderDirective() {

        function link(scope:IModelScope, el:JQuery, attrs) {

            var element:HTMLElement = el[0],
                param = attrs['param'],
                raw_value = scope.params[param], // needed to help smoothe slider motion
                precision = attrs['precision'] || 1,
                max = attrs['max'] || 10,
                min = attrs['min'] || 0,
                height = attrs['height'] || 40,
                radius = height / 2,
                margin = attrs['margin'] || 20;

            var svg:D3.Selection,
                circle:D3.Selection,
                line:D3.Selection;

            var width = element.parentElement.clientWidth - 2 * margin;

            var innerWidth = width - 2 * radius;

            function positionDelta(dx) {
                return dx * (max - min) / innerWidth
            }

            svg = d3.select(element).append('svg')
                .attr({width: element.parentElement.clientWidth, height: 2 * radius});

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
                    raw_value = Math.max(min, Math.min(max, dragPosition));
                    scope.$apply(function () {
                        scope.params[param] = Math.round(raw_value / parseFloat(precision)) * precision;
                    });
                })
                .on("dragend", function () {
                    d3.select(this).transition()
                        .ease("elastic")
                        .duration(500)
                        .attr("r", radius * 0.7);
                });

            // Draw slider line
            line = svg.append('line').attr({
                x1: radius,
                x2: radius + innerWidth,
                y1: radius,
                y2: radius,
                stroke: 'blue',
                strokeWidth: 1
            });

            // Establish y-coordinate and radius for control circle
            circle = svg.append('circle')
                .attr({cy: radius, r: radius * 0.7})
                .call(drag);

            // Set and update x-coordinate for control circle
            scope.$watch('value', function (value) {
                circle.attr({
                    cx: function () {
                        return radius + innerWidth * (value - min) / (max - min);
                    }
                });
            });

            scope.$on('resize', function () {
                width = element.parentElement.clientWidth - 2 * margin;
                innerWidth = width - 2 * radius;
                svg.attr('width', element.parentElement.clientWidth);
                line.attr('x2', radius + innerWidth);
                circle.attr({
                    cx: function () {
                        return radius + innerWidth * (scope.params[param] - min) / (max - min);
                    }
                });
            })


        }

        return {
            restrict: 'E',
            link: link,
            scope: false
        }
    }
}