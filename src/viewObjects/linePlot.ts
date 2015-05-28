/// <reference path="../kg.ts"/>

'use strict';

module KG {

    export interface ILinePlot extends IViewObject {

        data: ICoordinates[];
        interpolation: string;
    }

    export class LinePlot extends ViewObject implements ILinePlot {

        public data;
        public interpolation;

        constructor(definition) {

            definition = _.defaults(definition, {data: [], interpolation: 'linear'});
            super(definition);

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