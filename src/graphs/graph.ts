/// <reference path="../kg.ts"/>
/// <reference path="helpers.ts"/>
/// <reference path="axes.ts"/>
/// <reference path="composites/composite.ts"/>
/// <reference path="composites/point.ts"/>

module KineticGraphs
{

    // Additions to the scope of a graph
    export interface IGraph
    {

        element: JQuery;
        vis: D3.Selection;
        height: number;
        width: number;
        axes: IAxes;
        composites: IComposite[];
        renderGraph:(scope:IModelScope) => void;
        updateGraph:(scope:IModelScope) => void;

    }

    export class Graph implements IGraph
    {
        public height;
        public width;
        public axes;
        public composites;
        public vis;

        constructor(public element:JQuery) {
            this.axes = new Axes(element.attr('axes'));
            this.composites = [];
        }

        renderGraph = function(scope) {

            // Get attributes of <graph> element
            var element = this.element[0],
                attributes:NamedNodeMap = element.attributes;

            // Establish default dimensions of graph
            var elementDimensions: IDimensions = {width: element.parentElement.clientWidth, height: 500},
                margin: IMargins = {top: 20, left: 100, bottom: 100, right: 20};

            // Override with given attributes if they exist
            if(attributes.hasOwnProperty('height')) {
                elementDimensions.height = +attributes['height'].value;
            }
            if(attributes.hasOwnProperty('width')) {
                elementDimensions.width = Math.min(attributes['width'].value, elementDimensions.width);
            }

            // Establish inner dimensions of graph (element dimensions minus margins)
            var graphDimensions: IDimensions = {
                width: elementDimensions.width - margin.left - margin.right,
                height: elementDimensions.height - margin.top - margin.bottom
            };

            if (this.vis) {
                d3.select(element).select('svg').remove();
                d3.select(element).selectAll('div').remove();
            }

            this.vis = d3.select(element)
                .append("svg")
                .attr("width", elementDimensions.width)
                .attr("height", elementDimensions.height)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            this.axes.update(scope);
            this.axes.draw(this.vis,graphDimensions);

            this.updateGraph(scope);
        };

        updateGraph = function(scope) {

        };

    }



    // Creation of graph from element and children
    export function graphDirective(): ng.IDirective {

        return {
            restrict: 'E',
            link: function(scope: IModelScope, element: JQuery) {
                scope.graphs.push(new Graph(element));
            }
        }
    }

}

