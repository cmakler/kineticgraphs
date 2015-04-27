/// <reference path="../kg.ts" />

module KineticGraphs
{

    export interface IAxisDefinition
    {
        min?: number;
        max?: number;
        title?: string;
        ticks?: number;
        tickValues?: number[];
    }

    export interface IAxis
    {
        scaleFunction: (pixelLength: number, domain: IDomain) => D3.Scale.LinearScale;
        scale: D3.Scale.LinearScale;
        update: (axisDefinition: IAxisDefinition) => void;
        draw: (vis: D3.Selection, graph_dimensions: IDimensions) => void;
        domain: IDomain;
        title: string;
        ticks: number;
        tickValues: number[];
    }

    export class Axis implements IAxis{

        public scale;

        public domain: IDomain;
        public title: string;
        public ticks: number;
        public tickValues: number[];

        constructor(axisDefinition? : IAxisDefinition) {
            if(axisDefinition) {
                this.update(axisDefinition)
            }
        }

        update(axisDefinition) {

            if(this.domain) {
                if(axisDefinition.min) { this.domain.min = axisDefinition.min }
                if(axisDefinition.max) { this.domain.max = axisDefinition.max }
            } else {
                this.domain = new Domain(axisDefinition.min, axisDefinition.max);
            }

            this.title = axisDefinition.title || '';
            this.ticks = axisDefinition.ticks || 5;
            this.tickValues = axisDefinition.tickValues;

            return this;

        }

        draw(vis,graph_definition) {
            // overridden by child class
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

        draw(vis, graph_dimensions) {

            this.scale = this.scaleFunction(graph_dimensions.width,this.domain);

            var axis_vis = vis.append('g').attr('class', 'x axis').attr("transform", "translate(0," + graph_dimensions.height + ")");
            axis_vis.append("text")
                .attr("x", graph_dimensions.width / 2)
                .attr("y", "4em")
                .style("text-anchor", "middle")
                .text(this.title);
            axis_vis.call(d3.svg.axis().scale(this.scale).orient("bottom").ticks(this.ticks).tickValues(this.tickValues));
        }
    }

    export class YAxis extends Axis
    {

        scaleFunction(pixelLength,domain) {
            return d3.scale.linear()
                .range([pixelLength, 0])
                .domain(domain.toArray())
        }

        draw(vis, graph_dimensions) {

            this.scale = this.scaleFunction(graph_dimensions.height,this.domain);

            var axis_vis = vis.append('g').attr('class', 'y axis');
            axis_vis.append("text")
                .attr("transform", "rotate(-90)")
                .attr("x", -graph_dimensions.height / 2)
                .attr("y", "-4em")
                .style("text-anchor", "middle")
                .text(this.title);
            axis_vis.call(d3.svg.axis().scale(this.scale).orient("left").ticks(this.ticks).tickValues(this.tickValues));
        }
    }

}

