/// <reference path="../kg.ts"/>

module KineticGraphs
{

    // base interface for all graph objects
    // (they should all be able to render themselves)
    export interface IGraphObject
    {
        render: (graph:IGraphScope)=> IGraphScope
    }

    // base interface for all graph object scopes
    export interface IGraphObjectScope extends ng.IScope {

    }

    // rendered objects are the primitives that are rendered on the screen
    export interface IRenderedObjects {
        areas: D3.Selection[];
        rects: D3.Selection[];
        curves: D3.Selection[];
        lines: D3.Selection[];
        circles: D3.Selection[];
        select: (vis:D3.Selection) => void;
        render: (vis:D3.Selection) => D3.Selection;
    }

    export class RenderedObjects implements IRenderedObjects {

        public areas;
        public rects;
        public curves;
        public lines;
        public circles;

        constructor() {}

        select = function(vis) {
            ['area','rect','curve','line','circle'].forEach(function(objName){
                this[objName + 's'] = vis.append('g')
                    .attr('class', 'graph-objects')
                    .selectAll('g.' + objName);});
        };

        render = function(vis) {
            /*circles = circles.data(data);
            circles.exit().remove();
            circles.enter().append('circle');
            circles
                .attr('cx', function (d) {
                    return d.cx
                })
                .attr('cy', function (d) {
                    return d.cy
                })
                .attr('stroke', function(d) {
                    return d.color
                })
                .attr('fill', function (d) {
                    return d.color
                })
                .attr('r', function (d) {
                    return d.r || 10;
                });
            return circles;*/
            return vis;
        };

    }

}