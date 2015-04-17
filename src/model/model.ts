/// <reference path="../kg.ts" />

module KineticGraphs
{
    export interface IModelScope extends ng.IScope
    {
        params: {};
        graphs: IGraph[];
        render: () => void;
    }

    export class ModelController
    {

        constructor(public $scope:IModelScope)
        {
            $scope.params = {};
            $scope.graphs = [];

            $scope.render = function() {
                $scope.graphs.forEach(function(graph) {graph.renderGraph($scope)})
            }
        }

    }

}

