/// <reference path="../kg.ts" />

module KineticGraphs
{
    export interface IModelScope extends ng.IScope
    {
        params: {};
        graphDefinitions: string[];
        graphs: IGraph[];
        render: () => void;
    }

    export class ModelController
    {

        constructor(public $scope:IModelScope)
        {

            //$scope.graphDefinitions = ["{element_id:'graph', dimensions: {width: 400, height: 400}, xAxis: {min: 0, max: params.x, title: params.xAxisLabel},yAxis: {min: 0, max: 10, title: 'Y axis'}}"];

            $scope.params = {x: 20, xAxisLabel: 'Quantity'};

            function createGraphs() {
                var graphs = [];
                if($scope.graphDefinitions) {
                    $scope.graphDefinitions.forEach(function(graphDefinition) {graphs.push(new Graph($scope.$eval(graphDefinition)))});

                }
                return graphs;
            }

            function updateGraphs() {
                $scope.graphs = $scope.graphs || createGraphs();
                $scope.graphs.forEach(function(graph:IGraph,index) {
                    var updatedDefinition = $scope.$eval($scope.graphDefinitions[index]);
                    graph.updateGraph(updatedDefinition);
                })
            }

            $scope.$watchCollection('params',updateGraphs)

        }

    }

}

