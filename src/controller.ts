/// <reference path="kg.ts" />

module KineticGraphs
{
    export interface ScopeDefinition {
        params: {};
        model: ModelDefinition;
        views: ViewDefinition[];
    }

    export interface IScope extends ng.IScope
    {
        params: {}; // parameters of the model (may change through user actions)
        model: Model; // the base model (constant)
        views: View[]; // array of interactive elements, indexed by element ID
        init: (definition: any) => void;
    }

    export class Controller
    {

        constructor(public $scope:IScope, $window:ng.IWindowService)
        {

            $scope.init = function(definition:ScopeDefinition) {
                $scope.params = definition.params;
                $scope.model = createInstance(definition.model);
                $scope.model.update($scope, function() {
                    $scope.views = definition.views.map(function(view) { return createInstance(view) });
                });

            };

            // Updates and redraws interactive objects (graphs and sliders) when a parameter changes
            function render(redraw) {
                $scope.model.update($scope, function(){
                    $scope.views.forEach(function(view) {view.render($scope, redraw)});
                });
            }

            // Erase and redraw all graphs; do this when graph parameters change, or the window is resized
            function redrawGraphs() { render(true) }
            $scope.$watchCollection('graphParams',redrawGraphs);
            angular.element($window).on('resize', redrawGraphs);

            // Update objects on graphs (not the axes or graphs themselves); to this when model parameters change
            function redrawObjects() { render(false) }
            $scope.$watchCollection('params',redrawObjects);

            $scope.init({
                params: {
                    x: 5,
                    y: 5
                },
                model: {
                    type: 'Sample.TwoPoints',
                    definition: {
                        point1: {
                            type: 'Sample.SinglePoint',
                            definition: {
                                name: 'p1',
                                x: 'params.x',
                                y: 6
                            }
                        },
                        point2: {
                            type: 'Sample.SinglePoint',
                            definition: {
                                name: 'p2',
                                x: 3,
                                y: 'params.y'
                            }
                        }
                    }
                },
                views: [
                    {
                        type: 'KineticGraphs.Graph',
                        definition: {
                            element_id:'graph',
                            dimensions: {width: 700, height: 700},
                            xAxis: {min: 0, max: 10, title: '"Standard Deviation"'},
                            yAxis: {min: 0, max: 10, title: '"Mean"'},
                            objects: ['model.point1.point()']
                        }
                    }
                ]
            });

            render(true);

            /*var graphDef = "{element_id:'graph', dimensions: {width: 700, height: 700}, xAxis: {min: 0, max: 1, title: 'Standard Deviation'},yAxis: {min: 0, max: 0.5, title: 'Mean'}, graphObjects:[";
             var point1 = ",{type:'ControlDiv', definition: {name:'asset1', show:true, className: 'asset', text:'a_1', coordinates: functions.asset1.coordinates()}}";
             var point2 = ",{type:'ControlDiv', definition: {name:'asset2', show:true, className: 'asset', text:'a_2', coordinates: functions.asset2.coordinates()}}";
             var point3 = ",{type:'ControlDiv', definition: {name:'asset3', show:true, className: 'asset', text:'a_3', coordinates: functions.asset3.coordinates()}}";
             var linePlot3 = ",{type:'LinePlot', definition: {name: 'myLinePlot3', show: true, className: 'draw', data:functions.portfolio.twoAssetPortfolio(0,1,[0,0,0],params.maxLeverage)}}";
             var linePlot2 = ",{type:'LinePlot', definition: {name: 'myLinePlot2', show: true, className: 'draw', data:functions.portfolio.twoAssetPortfolio(1,2,[0,0,0],params.maxLeverage)}}";
             var linePlot1 = "{type:'LinePlot', definition: {name: 'myLinePlot1', show: true, className: 'draw', data:functions.portfolio.twoAssetPortfolio(0,2,[0,0,0],params.maxLeverage)}}";
             var portfolioPaths = ",{type:'PathFamily', definition: {name: 'myDataPaths', show: true, className: 'draw', data:functions.portfolio.data(params.maxLeverage)}}";
             var graphDefEnd = "]}";
             $scope.interactiveDefinitions = {
             graphs: [graphDef + linePlot1 + linePlot2 + linePlot3 + portfolioPaths + point1 + point2 + point3 + graphDefEnd],
             sliders: [
             "{element_id: 'slider12', param: 'rho01', precision: '0.1', axis: {min: -1, max: 1, tickValues: [-1,0,1]}}",
             "{element_id: 'slider23', param: 'rho12', precision: '0.1', axis: {min: -0.5, max: 0.5, tickValues: [-0.5,0,0.5]}}",
             "{element_id: 'slider13', param: 'rho02', precision: '0.1', axis: {min: -0.5, max: 0.5, tickValues: [-0.5,0,0.5]}}",
             "{element_id: 'leverageSlider', param: 'maxLeverage', precision: '1', axis: {min: 0, max: 400, tickValues: [0,200,400]}}"
             ]
             };
             $scope.params = ;
             $scope.functionDefinitions = {finance: [
             {name: 'asset1', model: 'PortfolioAnalysis', type: 'Asset', definition: "{mean: 'mean1', stdev: 'stdev1'}"},
             {name: 'asset2', model: 'PortfolioAnalysis', type: 'Asset', definition: "{mean: 'mean2', stdev: 'stdev2'}"},
             {name: 'asset3', model: 'PortfolioAnalysis', type: 'Asset', definition: "{mean: 'mean3', stdev: 'stdev3'}"},
             {name: 'portfolio', model: 'PortfolioAnalysis', type: 'Portfolio', definition: "{assets:[functions.asset1, functions.asset2, functions.asset3], correlationCoefficients: {rho12: params.rho12, rho23: params.rho23, rho13: params.rho13}}"}
             ]};

             // Creates graph objects from (string) graph definitions
             function createViews() {
             var interactives:IView[] = [];
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
             }*/



        }

    }

}

