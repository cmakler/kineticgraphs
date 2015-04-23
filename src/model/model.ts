/// <reference path="../kg.ts" />

module KineticGraphs
{
    export interface IModelScope extends ng.IScope
    {
        params: {}; // parameters of the model that do not require redrawing the entire graph
        graphParams: {}; // parameters of the model that do require redrawing the entire graph
        graphDefinitions: string[]; // definitions of the graph
        controlDefinitions: IControlDefinition[]; // definitions of controls
        graphs: IGraph[];
    }

    export class ModelController
    {

        constructor(public $scope:IModelScope, $window:ng.IWindowService)
        {

            $scope.graphDefinitions = ["{element_id:'graph', dimensions: {width: 700, height: 700}, xAxis: {min: 0, max: 20, title: graphParams.xAxisLabel},yAxis: {min: 0, max: 10, title: 'Y axis'}, graphObjects:[{type: 'Point', definition: {show: params.show, symbol: params.symbol, className: 'equilibrium', name: 'eqm', coordinates: {x: 'horiz', y: 'y'}}}]}"];
            $scope.controlDefinitions = [{type: 'slider', element_id: 'xSlider', param: 'horiz', min: 0, max: 30}];
            $scope.params = {horiz: 20, y: 4, show: true, symbol: 'circle'};
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
                        graphs.push(new Graph($scope, currentValue(graphDefinition)))
                    });
                }
                return graphs;
            }

            // Creates control objects from control definitions
            function createControls() {
                var controls = [];
                if($scope.controlDefinitions) {
                    $scope.controlDefinitions.forEach(function(controlDefinition) {
                        controls.push(new Control($scope, controlDefinition))
                    })
                }
                return controls;
            }

            // Updates and redraws graphs when a parameter changes
            function updateGraphs(redraw) {

                // Create graph objects if they don't already exist
                $scope.graphs = $scope.graphs || createGraphs();

                // Update each graph (updating triggers the graph to redraw its objects and possibly itself)
                $scope.graphs = $scope.graphs.map(function(graph:IGraph,index) {
                    return graph.updateGraph(currentValue($scope.graphDefinitions[index]), $scope, redraw);
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

