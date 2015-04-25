/// <reference path="../kg.ts"/>
/// <reference path="graphObjects.ts"/>

module KineticGraphs
{

    export interface IScatter extends IGraphObject {

        // point-specific attributes
        data: any;
        symbol: string;
        size: number;
    }

    export class Scatter extends GraphObject implements IScatter
    {

        // point-specific attributes
        public data;
        public symbol;
        public size;

        constructor() {

            super();

            // establish defaults
            this.data = [];
            this.size = 50;
            this.symbol = 'circle';
        }

        render(graph) {

            // constants TODO should these be defined somewhere else?
            var DATA_PATH_CLASS = 'scatter';

            function init(newGroup:D3.Selection) {
                return newGroup;
            }

            var group = graph.objectGroup(this.name, init);

            var dataPoints = group.selectAll('.' + DATA_PATH_CLASS).data(this.data);

            dataPoints.enter().append('path').attr('class', this.classAndVisibility() + ' ' + DATA_PATH_CLASS);
            dataPoints.attr({'d': d3.svg.symbol().type(this.symbol).size(this.size),
                'transform': function (d) {
                    return "translate(" + graph.xAxis.scale(d.x) + "," + graph.yAxis.scale(d.y) + ")";
                }
            });

            return graph;

        }
    }



}