/// <reference path="../kg.ts"/>

'use strict';

module KG
{

    // TwoVerticalGraphs definition objects
    export interface TwoVerticalGraphsDefinition extends ViewDefinition
    {
        topGraph: GraphDefinition;
        bottomGraph: GraphDefinition;
    }

    // Additions to the scope of a twoVerticalGraphs
    export interface ITwoVerticalGraphs extends IView
    {
        topGraph: Graph;
        bottomGraph: Graph;
    }

    export class TwoVerticalGraphs extends View implements ITwoVerticalGraphs
    {

        public topGraph;
        public bottomGraph;

        constructor(definition:TwoVerticalGraphsDefinition, modelPath?: string) {

            // ensure dimensions and margins are set; set any missing elements to defaults
            definition.maxDimensions = _.defaults(definition.maxDimensions || {}, { width: 800, height: 800 });

            super(definition, modelPath);

            // if top and bottom graphs share a common x axis, create axis elements
            if(definition.hasOwnProperty('xAxisDef')) {
                definition.topGraph.xAxisDef = _.clone(definition.xAxisDef);
                definition.topGraph.xAxisDef.title = '';
                definition.topGraph.margins = _.defaults(definition.topGraph.margins || {}, {top: 20, left: 100, bottom: 20, right: 20});
                definition.bottomGraph.xAxisDef = _.clone(definition.xAxisDef);
                definition.bottomGraph.margins = _.defaults(definition.bottomGraph.margins || {}, {top: 20, left: 100, bottom: 70, right: 20});
            }

            // establish definition for top and bottom graphs
            definition.topGraph.element_id = definition.element_id + '_top';
            this.topGraph = new Graph(definition.topGraph);

            definition.bottomGraph.element_id = definition.element_id + '_bottom';
            this.bottomGraph = new Graph(definition.bottomGraph);

        }

        redraw(scope) {
            var view = this;

            // Establish dimensions of the view
            var element = $('#' + view.element_id)[0];
            view.dimensions = {
                width: Math.min(view.maxDimensions.width, element.clientWidth),
                height: Math.min(view.maxDimensions.height, window.innerHeight - (10 + $('#' + view.element_id).offset().top - $(window).scrollTop()))};
            var graphHeight = view.dimensions.height/2;
            var bottomGraphTranslation = KG.translateByPixelCoordinates({x:0, y:graphHeight});

            d3.select(element).select('div').remove();

            // Create new div element to contain SVG
            var frame = d3.select(element).append('div');

            frame.append('div').attr('id',view.topGraph.element_id );
            frame.append('div').attr({'id': view.bottomGraph.element_id, 'style': bottomGraphTranslation});


            view.topGraph.maxDimensions.height = graphHeight;
            view.bottomGraph.maxDimensions.height = graphHeight;

            view.topGraph.updateParams = view.updateParams;
            view.bottomGraph.updateParams = view.updateParams;
            view.bottomGraph.redraw(scope);
            view.topGraph.redraw(scope);


            return view.drawObjects(scope);
        }

        drawObjects(scope) {
            var view = this;
            view.topGraph.drawObjects(scope);
            view.bottomGraph.drawObjects(scope);
            if(view.hasOwnProperty('objects')) {
                view.objects.forEach(function(object) {object.createSubObjects(view)});
                view.objects.forEach(function(object) {object.update(scope).render(view)});
                view.topGraph.objects.forEach(function(object) {object.update(scope).render(view.topGraph)});
                view.bottomGraph.objects.forEach(function(object) {object.update(scope).render(view.bottomGraph)});
            }
            return view;
        }

    }

}

