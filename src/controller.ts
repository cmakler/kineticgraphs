/// <reference path="kg.ts" />

'use strict';

declare var scopeDefinition:KG.ScopeDefinition;

module KG
{
    export interface ScopeDefinition {
        params: {};
        restrictions: RestrictionDefinition[];
        model: ModelDefinition;
        views: ViewDefinition[];
    }

    export interface IScope extends ng.IScope
    {
        params: {}; // parameters of the model (may change through user actions)
        restrictions: Restriction[]; // restrictions on parameters or any expression
        model: Model; // the base model (constant)
        views: View[]; // array of interactive elements, indexed by element ID
        init: (definition: any) => void;
        updateParams: (params) => void;
        renderMath: () => void;
        error: string;
    }

    export class Controller
    {

        constructor(public $scope:IScope, $window:ng.IWindowService)
        {

            $scope.init = function(definition:ScopeDefinition) {
                $scope.params = definition.params;
                $scope.restrictions = definition.restrictions.map(function(restrictionDefinition) {
                    return new Restriction(restrictionDefinition);
                });
                $scope.model = createInstance(definition.model);
                $scope.model.update($scope, function() {
                    $scope.views = definition.views.map(function(view) {
                        return createInstance(view);
                    });
                });

            };

            $scope.renderMath = function() {
                var mathElements = $('.math');
                for(var i=0; i<mathElements.length; i++){
                    var element:HTMLElement = mathElements[i];
                    if(!element.hasAttribute('raw')){
                        element.setAttribute('raw',element.textContent)
                    }
                    katex.render(element.getAttribute('raw'),element);
                }
            };

            // Updates and redraws interactive objects (graphs and sliders) when a parameter changes
            function render(redraw) {
                $scope.model.update($scope, function(){
                    $scope.views.forEach(function(view) {view.render($scope, redraw)});
                    $scope.renderMath();
                });

            }

            // Erase and redraw all graphs; do this when graph parameters change, or the window is resized
            function redrawGraphs() { render(true) }
            $scope.$watchCollection('graphParams',redrawGraphs);
            angular.element($window).on('resize', redrawGraphs);

            // Update objects on graphs (not the axes or graphs themselves); to this when model parameters change
            function redrawObjects() { render(false) }
            $scope.$watchCollection('params',redrawObjects);

            $scope.updateParams = function(params) {
                var oldParams = _.clone($scope.params);
                $scope.params = _.defaults(params,$scope.params);
                $scope.$apply();
                var validChange = true;
                $scope.restrictions.forEach(function(r:Restriction){
                    r.update($scope,null);
                    var validParams = r.validate($scope.params);
                    if(validParams == false){
                        validChange = false;
                        $scope.error = r.error;
                    } else {
                        $scope.params = validParams;
                        $scope.$apply();
                        $scope.error = '';
                    }
                });
                if(!validChange) {
                    $scope.params = oldParams;
                    $scope.$apply();
                }

            };

            $scope.init(scopeDefinition);

            render(true);

        }



    }

}

