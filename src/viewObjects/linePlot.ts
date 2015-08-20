/// <reference path="../kg.ts"/>

'use strict';

module KG {

    export interface ILinePlot extends ICurve {


    }

    export class LinePlot extends Curve implements ILinePlot {

        public data;
        public interpolation;

        constructor(definition) {

            super(definition);

            this.viewObjectSVGtype = 'path';
            this.viewObjectClass = 'dataPath';

        }

        render(view) {

            var linePlot = this;

            var dataCoordinates:ICoordinates[] = view.dataCoordinates(this.data);

            var group:D3.Selection = view.objectGroup(linePlot.name, linePlot.initGroupFn(), false);

            var dataLine = d3.svg.line()
                .interpolate(this.interpolation)
                .x(function (d) { return d.x })
                .y(function (d) { return d.y });

            var dataPath:D3.Selection = group.select('.' + linePlot.viewObjectClass);

            dataPath
                .attr({
                    'class': this.classAndVisibility() + ' ' + linePlot.viewObjectClass,
                    'd': dataLine(dataCoordinates)
                });

            return view;
        }

    }

}