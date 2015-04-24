/// <reference path="kg.ts" />

module KineticGraphs
{
    export interface IModelScope extends ng.IScope
    {
        params: {}; // parameters of the model that do not require redrawing the entire graph
        graphParams: {}; // parameters of the model that do require redrawing the entire graph
        interactiveDefinitions: any; // definitions of the graph
        interactives: IInteractive[];
    }

    export class ModelController
    {

        constructor(public $scope:IModelScope, $window:ng.IWindowService)
        {

            $scope.interactiveDefinitions = {graphs: ["{element_id:'graph', dimensions: {width: 700, height: 700}, xAxis: {min: 0, max: 20, title: graphParams.xAxisLabel},yAxis: {min: 0, max: 10, title: 'Y axis'}, graphObjects:[{type: 'Point', definition: {show: params.show, symbol: params.symbol, className: 'equilibrium', name: 'eqm', coordinates: {x: 'horiz', y: 'y'}}}]}"], sliders: ["{element_id: 'slider', param: 'horiz', axis: {min: 0, max: 30}}"]};
            $scope.params = {horiz: 20, y: 4, show: true, symbol: 'circle'};
            $scope.graphParams = {xAxisLabel: 'Quantity'};

            // Creates graph objects from (string) graph definitions
            function createInteractives() {
                var interactives:IInteractive[] = [];
                if($scope.hasOwnProperty('interactiveDefinitions')){
                    if($scope.interactiveDefinitions.hasOwnProperty('graphs')) {
                        $scope.interactiveDefinitions.graphs.forEach(function(graphDefinition) {
                            interactives.push(new Graph(graphDefinition))
                        })
                    }
                    if($scope.interactiveDefinitions.hasOwnProperty('sliders')) {
                        $scope.interactiveDefinitions.sliders.forEach(function(sliderDefinition) {
                            interactives.push(new Slider(sliderDefinition))
                        })
                    }
                }
                return interactives;
            }

            // Updates and redraws interactive objects (graphs and sliders) when a parameter changes
            function update(redraw) {

                // Create interactive objects if they don't already exist
                $scope.interactives = $scope.interactives || createInteractives();

                // Update each interactive (updating triggers the graph to redraw its objects and possibly itself)
                $scope.interactives = $scope.interactives.map(function(interactive:IInteractive) {
                    return interactive.update($scope, redraw);
                })
            }

            // Erase and redraw all graphs; do this when graph parameters change, or the window is resized
            function redrawGraphs() { update(true) }
            $scope.$watchCollection('graphParams',redrawGraphs);
            angular.element($window).on('resize', redrawGraphs);

            // Update objects on graphs (not the axes or graphs themselves); to this when model parameters change
            function redrawObjects() { update(false) }
            $scope.$watchCollection('params',redrawObjects);

        }

    }

}

