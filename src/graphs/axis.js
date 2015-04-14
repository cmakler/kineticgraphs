/// <reference path="../kg.ts" />
var KineticGraphs;
(function (KineticGraphs) {
    // The link function registers the axis with the parent graph
    function Axis() {
        function link(scope, element, attributes, graph) {
            var axis = {
                dim: scope.dim,
                domain: {
                    min: scope.min() || 0,
                    max: scope.max() || 10
                },
                title: scope.title || scope.dim + ' axis',
                ticks: scope.ticks() || 5
            };
            graph.addAxis(axis);
        }
        return {
            link: link,
            restrict: 'E',
            require: '^graph',
            scope: { dim: '@', min: '&', max: '&', title: '@', ticks: '&' }
        };
    }
    KineticGraphs.Axis = Axis;
})(KineticGraphs || (KineticGraphs = {}));
//# sourceMappingURL=axis.js.map