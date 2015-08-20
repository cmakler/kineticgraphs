/// <reference path="../kg.ts"/>

'use strict';

module KG {

    export interface IPathFamily extends IViewObject {

        data: ICoordinates[][];
        interpolation: string;
    }

    export class PathFamily extends ViewObject implements IPathFamily {

        public data;
        public interpolation;

        constructor(definition) {

            definition = _.defaults(definition, {
                data: [],
                interpolation: 'basis'
            });
            super(definition);

            this.viewObjectSVGtype = 'g';
            this.viewObjectClass = 'dataPathFamily';

        }

        render(view) {

            var pathFamily = this;

            var group:D3.Selection = view.objectGroup(pathFamily.name, pathFamily.initGroupFn(), false);

            var dataLine = d3.svg.line()
                .interpolate(this.interpolation)
                .x(function (d) {
                    return view.xAxis.scale(d.x)
                })
                .y(function (d) {
                    return view.yAxis.scale(d.y)
                });


            var dataPaths:D3.UpdateSelection = group
                .select('.' + pathFamily.viewObjectClass)
                .selectAll('path')
                .data(this.data);

            dataPaths.enter().append('path');

            dataPaths.attr({
                'd': function(d) { return dataLine(d) },
                'class': this.classAndVisibility()
            });

            dataPaths.exit().remove();



            return view;
        }

    }

}