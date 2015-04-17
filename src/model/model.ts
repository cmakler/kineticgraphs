/// <reference path="../kg.ts" />

module KineticGraphs
{
    export interface IModelScope extends ng.IScope
    {
        params: {}; // parameters of the model that do not require redrawing the entire graph
        graphParams: {}; // parameters of the model that do require redrawing the entire graph
        graphDefinitions: string[]; // definitions of the graph
        graphs: IGraph[];
    }

    export class ModelController
    {

        constructor(public $scope:IModelScope, $window:ng.IWindowService)
        {

            $scope.graphDefinitions = ["{element_id:'graph', dimensions: {width: 700, height: 700}, xAxis: {min: 0, max: 20, title: graphParams.xAxisLabel},yAxis: {min: 0, max: 10, title: 'Y axis'}}"];
            $scope.params = {x: 20};
            $scope.graphParams = {xAxisLabel: 'Quantity'};

            // Creates an object based on string using current scope parameter values
            function currentValue(s:string) {
                return $scope.$eval(s)
            }

            // Creates graph objects from (string) graph definitions
            function createGraphs() {
                var graphs = [];
                if($scope.graphDefinitions) {
                    $scope.graphDefinitions.forEach(function(graphDefinition) {
                        graphs.push(new Graph(currentValue(graphDefinition)))
                    });
                }
                return graphs;
            }

            // Updates and redraws graphs when a parameter changes
            function updateGraphs(redraw) {

                // Create graph objects if they don't already exist
                $scope.graphs = $scope.graphs || createGraphs();

                // Update each graph (updating triggers the graph to redraw its objects and possibly itself)
                $scope.graphs = $scope.graphs.map(function(graph:IGraph,index) {
                    return graph.updateGraph(currentValue($scope.graphDefinitions[index]),redraw);
                })
            }

            // Erase and redraw all graphs; do this when graph parameters change, or the window is resized
            function redrawGraphs() { updateGraphs(true) }
            $scope.$watchCollection('graphParams',redrawGraphs);
            angular.element($window).on('resize', redrawGraphs);

            // Update objects on graphs (not the axes or graphs themselves); to this when model parameters change
            function redrawObjects() { updateGraphs(false) }
            $scope.$watchCollection('params',redrawObjects);

        }

    }

}

