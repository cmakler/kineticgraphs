/// <reference path="../kg.ts"/>
/// <reference path="graphObjects.ts"/>

module KineticGraphs {

    export interface ILinePlot extends IGraphObject {

        data: ICoordinates[];
        interpolation: string;
    }

    export class LinePlot extends GraphObject implements ILinePlot {

        public data;
        public interpolation;

        constructor() {

            super();
            this.data = [];
            this.interpolation = 'linear';

        }

        render(graph) {

            // constants TODO should these be defined somewhere else?
            var DATA_PATH_CLASS = 'dataPath';

            var dataCoordinates:ICoordinates[] = graph.dataCoordinates(this.data);

            function init(newGroup:D3.Selection) {
                newGroup.append('path').attr('class', DATA_PATH_CLASS);
                return newGroup;
            }

            var group:D3.Selection = graph.objectGroup(this.name, init);

            var dataLine = d3.svg.line()
                .interpolate(this.interpolation)
                .x(function (d) { return d.x })
                .y(function (d) { return d.y });

            var dataPath:D3.Selection = group.select('.' + DATA_PATH_CLASS);

            dataPath
                .attr({
                    'class': this.classAndVisibility() + ' ' + DATA_PATH_CLASS,
                    'd': dataLine(dataCoordinates)
                });

            return graph;
        }

    }

}