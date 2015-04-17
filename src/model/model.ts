/// <reference path="../kg.ts" />

module KineticGraphs
{
    export interface IModelScope extends ng.IScope
    {
        params: {}; // parameters of the model that do not require redrawing the entire graph
        graphParams: {}; // parameters of the model that do require redrawing the entire graph
        graphDefinitions: string[]; // definitions of the graph
        graphs: IGraph[];
        render: () => void;
    }

    export class ModelController
    {

        constructor(public $scope:IModelScope, $window:ng.IWindowService)
        {

            $scope.graphDefinitions = ["{element_id:'graph', dimensions: {width: 700, height: 700}, xAxis: {min: 0, max: 20, title: graphParams.xAxisLabel},yAxis: {min: 0, max: 10, title: 'Y axis'}}"];

            $scope.graphParams = {x: 20, xAxisLabel: 'Quantity'};

            function createGraphs() {
                var graphs = [];
                if($scope.graphDefinitions) {
                    $scope.graphDefinitions.forEach(function(graphDefinition) {graphs.push(new Graph($scope.$eval(graphDefinition)))});
                }
                return graphs;
            }

            function redrawGraphs() {
                updateGraphs(true)
            }

            function redrawObjects() {
                updateGraphs(false)
            }

            function updateGraphs(redraw) {
                $scope.graphs = $scope.graphs || createGraphs();
                $scope.graphs.forEach(function(graph:IGraph,index) {
                    var updatedDefinition = $scope.$eval($scope.graphDefinitions[index]);
                    graph.updateGraph(updatedDefinition,redraw);
                })
            }

            $scope.$watchCollection('params',redrawObjects);
            $scope.$watchCollection('graphParams',redrawGraphs);

            // Resize all elements when window changes size
            angular.element($window).on('resize', redrawGraphs);

        }

    }

}

