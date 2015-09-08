/// <reference path="kg.ts" />

'use strict';

declare var scopeDefinition:KG.ScopeDefinition;

module KG
{
    export interface ScopeDefinition {
        params: {};
        graphParams: string[];
        restrictions: RestrictionDefinition[];
        model: ModelDefinition;
        views: ViewDefinition[];
    }

    export interface IScope extends ng.IScope
    {
        params: {};                     // parameters of the model (may change through user actions)
        graphParams: {};          // list of parameter names that should trigger graph redraw
        restrictions: Restriction[];    // restrictions on parameters or any expression
        model: Model;                   // the base model (constant)
        views: View[];                  // array of interactive elements, indexed by element ID
        init: (definition: any) => void;
        updateParams: (params) => void;
        renderMath: () => void;
        error: string;
        interpolate: any;
        color: (className:string) => string;
    }

    export class Controller
    {

        constructor(public $scope:IScope, public $interpolate, $window:ng.IWindowService)
        {

            $scope.interpolate = $interpolate;

            $scope.color = function(className) {
                return KG.colorForClassName(className);
            }

            $scope.init = function(definition:ScopeDefinition) {
                $scope.params = definition.params;
                $scope.graphParams = {};
                if(definition.graphParams) {
                    definition.graphParams.forEach(function(key) {
                        if($scope.params.hasOwnProperty(key)) {
                            $scope.graphParams[key] = $scope.params[key];
                        }
                    })
                }
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

                var equationElements = $('equation');
                for(var i=0; i<equationElements.length; i++) {
                    var element:HTMLElement = equationElements[i];
                    if(!element.hasAttribute('raw')){
                        element.setAttribute('raw',element.textContent);
                    }
                    element.innerHTML = '';
                    var lines = element.getAttribute('raw').split('||');
                    var equation:D3.Selection = d3.select(element).append('table').attr('align','center');
                    for(var l=0; l<lines.length; l++) {
                        var line = equation.append('tr');
                        if(lines[l].indexOf('frac') > -1) {line.style('height','85px')};
                        var lineElements = lines[l].split('=');
                        for(var le=0; le<lineElements.length; le++) {
                            var lineElement = line.append('td').attr('class','math big').text('\\displaystyle{' + lineElements[le] + '}');
                            if(le == 0) {
                                lineElement.style('text-align','right');
                            } else {
                                lineElement.style('text-align','left')
                            }
                            if(le < lineElements.length - 1) {
                                line.append('td').attr('class','math big').style('padding','10px').style('valign','middle').text('=');
                            }
                        }
                    }
                }

                var mathElements = $('.math');
                for(var i=0; i<mathElements.length; i++){
                    var element:HTMLElement = mathElements[i];
                    if(!element.hasAttribute('raw')){
                        element.setAttribute('raw',element.textContent)
                    }
                    var textToRender = $scope.interpolate(element.getAttribute('raw'))($scope);
                    var displayMode = element.classList.contains('displayMath');
                    katex.render(textToRender,element,{displayMode:displayMode});
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
                        if($scope.graphParams) {
                            for(var key in $scope.graphParams) {
                                $scope.graphParams[key] = $scope.params[key];
                            }
                        }
                        $scope.$apply();
                        $scope.error = '';
                    }
                });
                if(!validChange) {
                    $scope.params = oldParams;
                    $scope.$apply(redrawObjects);
                }

            };

            $scope.init(scopeDefinition);

            render(true);

        }



    }

}

