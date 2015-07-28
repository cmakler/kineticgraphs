/// <reference path="../kg.ts"/>

'use strict';

module KG
{

    export interface IScatter extends IViewObject {

        // point-specific attributes
        data: any;
        symbol: string;
        size: number;
    }

    export class Scatter extends ViewObject implements IScatter
    {

        // point-specific attributes
        public data;
        public symbol;
        public size;

        constructor() {

            super();

            // establish defaults
            this.data = [];
            this.size = 25;
            this.symbol = 'circle';
        }

        render(graph) {

            // constants TODO should these be defined somewhere else?
            var DATA_PATH_CLASS = 'scatter',
                scope = graph.scope;

            function init(newGroup:D3.Selection) {
                return newGroup;
            }

            var group = graph.objectGroup(this.name, init);

            var dataPoints = group.selectAll('.' + DATA_PATH_CLASS).data(this.data);

            dataPoints.enter().append('path').attr('class', this.classAndVisibility() + ' ' + DATA_PATH_CLASS)
                .on('mouseover', function(d){
                    scope.$apply(function(){scope.selectedScatterPoint = d;});
                })
                .on('mouseout', function(d){
                    scope.$apply(function(){scope.selectedScatterPoint = null;});
                });

            dataPoints.attr({
                'd': d3.svg.symbol().type(this.symbol).size(this.size),
                'fill': function(d) { return d.color },
                'transform': function (d) {
                    return "translate(" + graph.xAxis.scale(d.x) + "," + graph.yAxis.scale(d.y) + ")";
                }
            });

            dataPoints.exit().remove();

            return graph;

        }
    }



}