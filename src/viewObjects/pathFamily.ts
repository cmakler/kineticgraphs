/// <reference path="../kg.ts"/>
/// <reference path="graphObjects.ts"/>

module KineticGraphs {

    export interface IPathFamily extends IViewObject {

        data: ICoordinates[][];
        interpolation: string;
    }

    export class PathFamily extends ViewObject implements ILinePlot {

        public data;
        public interpolation;

        constructor() {

            super();
            this.data = [];
            this.interpolation = 'basis';

        }

        render(graph) {

            // constants TODO should these be defined somewhere else?
            var DATA_PATH_FAMILY_CLASS = 'dataPathFamily';

            function init(newGroup:D3.Selection) {
                newGroup.append('g').attr('class', DATA_PATH_FAMILY_CLASS);
                return newGroup;
            }

            var group:D3.Selection = graph.objectGroup(this.name, init);

            var dataLine = d3.svg.line()
                .interpolate(this.interpolation)
                .x(function (d) {
                    return graph.xAxis.scale(d.x)
                })
                .y(function (d) {
                    return graph.yAxis.scale(d.y)
                });


            var dataPaths:D3.UpdateSelection = group
                .select('.' + DATA_PATH_FAMILY_CLASS)
                .selectAll('path')
                .data(this.data);

            dataPaths.enter().append('path');

            dataPaths.attr({
                'd': function(d) { return dataLine(d) }
            });

            dataPaths.exit().remove();



            return graph;
        }

    }

}