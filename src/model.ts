/// <reference path="kg.ts" />

module KineticGraphs
{
    export interface IModelScope extends ng.IScope
    {
        params: {}; // parameters of the model that do not require redrawing the entire graph
        graphParams: {}; // parameters of the model that do require redrawing the entire graph
        interactiveDefinitions: any; // definitions of the graph
        functionDefinitions: any; // definitions of functions
        interactives: IInteractive[];
        functions: any;
    }

    export class ModelController
    {

        constructor(public $scope:IModelScope, $window:ng.IWindowService)
        {

            var graphDef = "{element_id:'graph', dimensions: {width: 700, height: 700}, xAxis: {min: 0, max: 10, title: 'Variance'},yAxis: {min: 0, max: 20, title: 'Mean'}, graphObjects:[";
            var point1 = "{type:'Point', definition: {name:'asset1', show:true, className: 'asset', coordinates: functions.asset1.coordinates()}},";
            var point2 = "{type:'Point', definition: {name:'asset2', show:true, className: 'asset', coordinates: functions.asset2.coordinates()}}";
            var linePlot = "{type:'LinePlot', definition: {name: 'myLinePlot', show: true, className: 'draw', data:functions.porfolio.data()}},";
            var graphDefEnd = "]}";
            $scope.interactiveDefinitions = {graphs: [graphDef + linePlot + point1 + point2 + graphDefEnd], sliders: ["{element_id: 'slider', param: 'covariance', precision: '0.1', axis: {min: 0, max: 1}}"]};
            $scope.params = {covariance: 0.8, mean1: 10, var1: 4, mean2: 13, var2: 5};
            $scope.functionDefinitions = {finance: [
                {name: 'asset1', model: 'CAPM', type: 'Asset', definition: "{mean: 'mean1', variance: 'var1'}"},
                {name: 'asset2', model: 'CAPM', type: 'Asset', definition: "{mean: 'mean2', variance: 'var2'}"},
                {name: 'portfolio', model: 'CAPM', type: 'Portfolio', definition: "{assets:[functions.asset1, functions.asset2]}"}
            ]};
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

            // Creates functions
            function createFunctions() {
                var functions = {};
                if($scope.hasOwnProperty('functionDefinitions')){
                    if($scope.functionDefinitions.hasOwnProperty('finance')) {
                        $scope.functionDefinitions.finance.forEach(function(functionDefinition) {
                            functions[functionDefinition.name] = new FinanceGraphs[functionDefinition.model][functionDefinition.type](functionDefinition.definition);
                        })
                    }
                }
                return functions;
            }

            // Updates and redraws interactive objects (graphs and sliders) when a parameter changes
            function update(redraw) {

                // Create interactive objects if they don't already exist
                $scope.functions = $scope.functions || createFunctions();
                $scope.interactives = $scope.interactives || createInteractives();

                // Update each function
                for(var name in $scope.functions){
                    $scope.functions[name] = $scope.functions[name].update($scope);
                }

                // Update each interactive (updating triggers the graph to redraw its objects and possibly itself)
                $scope.interactives = $scope.interactives.map(function(interactive:IInteractive) {
                    interactive.update($scope);
                    if(redraw) {
                        interactive.redraw();
                    }
                    interactive.drawObjects();
                    return interactive;
                });
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

