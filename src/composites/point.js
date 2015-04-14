/**
 * Created by cmakler on 4/8/15.
 */
/// <reference path="../kg.ts"/>
/// <reference path="composite.ts"/>
var KineticGraphs;
(function (KineticGraphs) {
    var Point = (function () {
        function Point(scope) {
            this.render = function (graph) {
                var cx = graph.x(this.coordinates.x), cy = graph.y(this.coordinates.y);
                graph.vis.append('circle').attr({ cx: cx, cy: cy, r: 3 });
                return graph;
            };
            this.coordinates = scope.coordinates();
        }
        return Point;
    })();
    KineticGraphs.Point = Point;
    function pointDirective() {
        return {
            restrict: 'E',
            require: '^graph',
            link: function (scope, element, attributes, graph) {
                graph.addComposite(new Point(scope));
            },
            scope: { coordinates: '&' }
        };
    }
    KineticGraphs.pointDirective = pointDirective;
})(KineticGraphs || (KineticGraphs = {}));
//# sourceMappingURL=point.js.map