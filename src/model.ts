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

            var graphDef = "{element_id:'graph', dimensions: {width: 700, height: 700}, xAxis: {min: 0, max: 1, title: 'Standard Deviation'},yAxis: {min: 0, max: 0.5, title: 'Mean'}, graphObjects:[";
            var point1 = ",{type:'ControlPoint', definition: {name:'asset1', show:true, className: 'asset', coordinates: functions.asset1.coordinates()}}";
            var point2 = ",{type:'ControlPoint', definition: {name:'asset2', show:true, className: 'asset', coordinates: functions.asset2.coordinates()}}";
            var point3 = ",{type:'ControlPoint', definition: {name:'asset3', show:true, className: 'asset', coordinates: functions.asset3.coordinates()}}";
            var linePlot3 = ",{type:'LinePlot', definition: {name: 'myLinePlot3', show: true, className: 'draw', data:functions.portfolio.twoAssetPortfolio(0,1,[0,0,0],{min:-5,max:6},1000)}}";
            var linePlot2 = ",{type:'LinePlot', definition: {name: 'myLinePlot2', show: true, className: 'draw', data:functions.portfolio.twoAssetPortfolio(1,2,[0,0,0],{min:-5,max:6},1000)}}";
            var linePlot1 = "{type:'LinePlot', definition: {name: 'myLinePlot1', show: true, className: 'draw', data:functions.portfolio.twoAssetPortfolio(0,2,[0,0,0],{min:-5,max:6},1000)}}";
            var scatterPlot = ",{type:'Scatter', definition: {name: 'myLinePlot', show: true, className: 'draw', data:functions.portfolio.data()}}";
            var graphDefEnd = "]}";
            $scope.interactiveDefinitions = {
                graphs: [graphDef + linePlot1 + linePlot2 + linePlot3 + scatterPlot + point1 + point2 + point3 + graphDefEnd],
                sliders: [
                    "{element_id: 'slider12', param: 'rho01', precision: '0.1', axis: {min: -1, max: 1, tickValues: [-1,0,1]}}",
                    "{element_id: 'slider23', param: 'rho12', precision: '0.1', axis: {min: -1, max: 1, tickValues: [-1,0,1]}}",
                    "{element_id: 'slider13', param: 'rho02', precision: '0.1', axis: {min: -1, max: 1, tickValues: [-1,0,1]}}"]
            };
            $scope.params = {
                rho01: 0.8,
                rho12: -0.4,
                rho02: 1,
                mean1: 0.4,
                stdev1: 0.4,
                mean2: 0.2,
                stdev2: 0.1,
                mean3: 0.3,
                stdev3: 0.8
            };
            $scope.functionDefinitions = {finance: [
                {name: 'asset1', model: 'PortfolioAnalysis', type: 'Asset', definition: "{mean: 'mean1', stdev: 'stdev1'}"},
                {name: 'asset2', model: 'PortfolioAnalysis', type: 'Asset', definition: "{mean: 'mean2', stdev: 'stdev2'}"},
                {name: 'asset3', model: 'PortfolioAnalysis', type: 'Asset', definition: "{mean: 'mean3', stdev: 'stdev3'}"},
                {name: 'portfolio', model: 'PortfolioAnalysis', type: 'Portfolio', definition: "{assets:[functions.asset1, functions.asset2, functions.asset3], correlationCoefficients: {rho12: params.rho12, rho23: params.rho23, rho13: params.rho13}}"}
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

