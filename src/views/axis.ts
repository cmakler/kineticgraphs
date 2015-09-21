/// <reference path="../kg.ts" />

'use strict';

module KG
{

    export interface AxisDefinition extends ModelDefinition
    {
        min: any;
        max: any;
        title: string;
        ticks: number;
        tickValues: number[];
        axisBuffer: number;
    }

    export interface IAxis extends IModel
    {
        min: number;
        max: number;
        scaleFunction: (pixelLength: number, domain: IDomain) => D3.Scale.LinearScale;
        scale: D3.Scale.LinearScale;
        draw: (vis: D3.Selection, divs: D3.Selection, graph_dimensions: IDimensions, margins: IMargins) => void;
        domain: IDomain;
        title: string;
        ticks: number;
        tickValues: number[];
        textMargin: number;
        axisBuffer: number;
    }

    export class Axis extends Model implements IAxis
    {

        public scale;
        public min;
        public max;

        public domain: IDomain;
        public title: string;
        public ticks: number;
        public tickValues: number[];

        public textMargin;
        public axisBuffer;

        constructor(definition : AxisDefinition, modelPath?: string) {

            definition = _.defaults(definition, {
                min: 0,
                max: 10,
                title: '',
                ticks: 5,
                textMargin: 8,
                axisBuffer: 30
            });

            super(definition, modelPath);
            if(this.ticks == 0) {
                this.textMargin = 7;
            }
            this.domain = new KG.Domain(definition.min, definition.max);
        }

        draw(vis, divs, graph_definition, margins) {
            // overridden by child class
        }

        _update(scope) {
            this.domain.min = this.min;
            this.domain.max = this.max;
            return this;
        }

        scaleFunction(pixelLength, domain) {
            return d3.scale.linear(); // overridden by child class
        }

    }

    export class XAxis extends Axis
    {

        scaleFunction(pixelLength, domain) {
            return d3.scale.linear()
                .range([0, pixelLength])
                .domain(domain.toArray())
        }

        draw(vis, divs, graph_dimensions, margins) {

            this.scale = this.scaleFunction(graph_dimensions.width,this.domain);

            var axis_vis = vis.append('g')
                .attr('class', 'x axis')
                .attr("transform", "translate(0," + graph_dimensions.height + ")");
            axis_vis.call(d3.svg.axis().scale(this.scale).orient("bottom").ticks(this.ticks).tickValues(this.tickValues));

            var title = divs.append("div")
                .style('text-align','center')
                .style('position','absolute')
                .style('width',graph_dimensions.width + 'px')
                .style('height',(margins.bottom - this.axisBuffer) + 'px')
                .style('left', margins.left + 'px')
                .style('top',(margins.top + graph_dimensions.height + this.axisBuffer) + 'px')
                .attr('class','medium');

            katex.render(this.title.toString(),title[0][0]);

        }
    }

    export class YAxis extends Axis
    {

        scaleFunction(pixelLength,domain) {
            return d3.scale.linear()
                .range([pixelLength, 0])
                .domain(domain.toArray())
        }

        draw(vis, divs, graph_dimensions, margins) {

            this.scale = this.scaleFunction(graph_dimensions.height,this.domain);

            var axis_vis = vis.append('g').attr('class', 'y axis');
            axis_vis.call(d3.svg.axis().scale(this.scale).orient("left").ticks(this.ticks).tickValues(this.tickValues));

            var title = divs.append("div")
                .style('text-align','center')
                .style('position','absolute')
                .style('width',graph_dimensions.height + 'px')
                .style('height',(margins.left - this.axisBuffer) + 'px')
                .style('left',0.5*(margins.left - graph_dimensions.height - this.axisBuffer)+'px')
                .style('top',margins.top + 0.5*(graph_dimensions.height - margins.left + this.axisBuffer) + 'px')
                .style('-webkit-transform','rotate(-90deg)')
                .style('transform','rotate(-90deg)')
                .attr('class','medium');

            katex.render(this.title.toString(),title[0][0]);

        }
    }

}

