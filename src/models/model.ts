/// <reference path="../kg.ts" />

module KineticGraphs
{

    export interface IModelController
    {
        graphs: IGraph[];
        params: any[];
        controls: any[];
        addGraph: (IGraphController) => void;
        addParam: (any) => void;
        addControl: (any) => void;
    }

    export class ModelController implements IModelController
    {

        public graphs;
        public params;
        public controls;

        constructor($scope:ng.IScope) {
            this.graphs = [];
            this.params = [];
            this.controls = [];
        }

        addGraph = function(graph) {
            this.graphs.push(graph)
        };

        addParam = function(param) {
            this.params.push(param);
        };

        addControl = function(control) {
            this.controls.push(control)
        }

    }

    export function Model(): ng.IDirective {
        return {
            restrict: 'E',
            template: '<div><div ng-transclude/></div>',
            transclude: true,
            controller: ModelController
        }
    }
}

