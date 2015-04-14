/// <reference path="../kg.ts" />
var KineticGraphs;
(function (KineticGraphs) {
    var ModelController = (function () {
        function ModelController($scope) {
            this.addGraph = function (graph) {
                this.graphs.push(graph);
            };
            this.addParam = function (param) {
                this.params.push(param);
            };
            this.addControl = function (control) {
                this.controls.push(control);
            };
            this.graphs = [];
            this.params = [];
            this.controls = [];
        }
        return ModelController;
    })();
    KineticGraphs.ModelController = ModelController;
    function Model() {
        return {
            restrict: 'E',
            template: '<div><div ng-transclude/></div>',
            transclude: true,
            controller: ModelController
        };
    }
    KineticGraphs.Model = Model;
})(KineticGraphs || (KineticGraphs = {}));
//# sourceMappingURL=model.js.map