/// <reference path="../kg.ts"/>
/// <reference path="graphObjects.ts"/>

module KineticGraphs {

    export interface ILinePlot extends IGraphObject {

        data: ICoordinates[];
    }

    export class LinePlot extends GraphObject implements ILinePlot {

        public data;

        constructor() {

            super();
            this.data = [];

        }

        render(graph) {

            // constants TODO should these be defined somewhere else?
            var DATA_PATH_CLASS = 'dataPath';

            function init(newGroup:D3.Selection) {
                newGroup.append('path').attr('class', DATA_PATH_CLASS);
                return newGroup;
            }

            var group:D3.Selection = graph.objectGroup(this.name, init);

            var dataLine = d3.svg.line()
                .interpolate('linear')
                .x(function (d) {
                    return graph.xAxis.scale(d.x)
                })
                .y(function (d) {
                    return graph.yAxis.scale(d.y)
                });

            var dataPath:D3.Selection = group.select('.' + DATA_PATH_CLASS);

            dataPath
                .attr({
                    'class': this.classAndVisibility() + ' ' + DATA_PATH_CLASS,
                    'd': dataLine(this.data)
                });

            return graph;
        }

    }

}