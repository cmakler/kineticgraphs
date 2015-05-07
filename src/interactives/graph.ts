/// <reference path="../kg.ts"/>
/// <reference path="interactive.ts" />


module KineticGraphs
{

    // Graph definition objects
    export interface IGraphDefinition extends IInteractiveDefinition
    {
        xAxis: IAxisDefinition;
        yAxis: IAxisDefinition;
        graphObjects?: IGraphObjectFactoryDefinition[];
    }

    // Additions to the scope of a graph
    export interface IGraph extends IInteractive
    {
        xAxis: IAxis;
        yAxis: IAxis;

        divs: D3.Selection;
        graphObjects: IGraphObjects;
        objectGroup: (name:string, init:((newGroup:D3.Selection) => D3.Selection)) => D3.Selection;
        getDiv: (name:string) => D3.Selection;

        updateParams:(any) => void;

        // methods for handling points outside the graph area
        xOnGraph: (x:number) => boolean;
        yOnGraph: (x:number) => boolean;
        onGraph: (coordinates:ICoordinates) => boolean;

        // methods for converting model coordiantes to pixel coordinates
        pixelCoordinates: (coordinates:ICoordinates) => ICoordinates;
        dataCoordinates: (coordinateArray:ICoordinates[]) => ICoordinates[];
    }

    export class Graph extends Interactive implements IGraph
    {
        public xAxis;
        public yAxis;
        public divs;
        public graphObjects;
        public graphDivs;

        constructor(public definitionString:string) {
            super(definitionString);
            this.xAxis = new XAxis();
            this.yAxis = new YAxis();
            this.graphDivs = [];
        }

        // Used to update parameters of the model from within the graph
        updateParams(params:any) {
            for (var key in params) {
                if (params.hasOwnProperty(key) && this.scope.params.hasOwnProperty(key)) {
                    this.scope.params[key] = params[key];
                }
            }
            this.scope.$apply();
        }

        objectGroup(name, init:((newGroup:D3.Selection) => D3.Selection)) {
            var group = this.vis.select('#' + name);
            if(group.empty()) {
                group = this.vis.append('g').attr('id',name);
                group = init(group)
            }
            return group;
        }

        getDiv(name) {
            var selection = this.divs.select('#' + name);
            if (selection.empty()) {
                selection = this.divs.append('div').attr('id',name);
            }
            return selection;
        }

        xOnGraph(x:number) {
            return this.xAxis.domain.contains(x);
        }

        yOnGraph(y:number) {
            return this.yAxis.domain.contains(y);
        }

        // Check to see if a point is on the graph
        onGraph(coordinates:ICoordinates) {
            return (this.xOnGraph(coordinates.x) && this.yOnGraph(coordinates.y));
        }

        // Convert model coordinates to pixel coordinates for a single point
        pixelCoordinates(coordinates:ICoordinates) {
            coordinates.x = this.xAxis.scale(coordinates.x);
            coordinates.y = this.yAxis.scale(coordinates.y);
            return coordinates;
        }

        // Transform pixel coordinates
        translateByCoordinates(coordinates:ICoordinates) {
            return KineticGraphs.translateByPixelCoordinates(this.pixelCoordinates(coordinates));
        }

        positionByCoordinates(coordinates:ICoordinates, dimension?:IDimensions) {
            return KineticGraphs.positionByPixelCoordinates(this.pixelCoordinates(coordinates), dimension);
        }

        // Convert model coordinates to pixel coordinates for an array of points
        dataCoordinates(coordinateArray:ICoordinates[]) {
            var graph = this;
            return coordinateArray.map(graph.pixelCoordinates, graph);
        }

        // Update graph based on latest parameters
        redraw() {

            var graph = this,
                definition = this.definition,
                updateDimensions = this.updateDimensions;

            // Redraw the graph if necessary
            console.log('redrawing graph!');

            // Establish dimensions of the graph
            var element = $('#' + definition.element_id)[0];
            var dimensions = updateDimensions(element.clientWidth, definition.dimensions);
            var margins = definition.margins || {top: 20, left: 100, bottom: 100, right: 20};
            var visTranslation = KineticGraphs.translateByPixelCoordinates({x:margins.left, y:margins.top});

            // Update axis objects
            graph.xAxis.update(definition.xAxis);
            graph.yAxis.update(definition.yAxis);

            // Remove existing graph
            d3.select(element).select('div').remove();

            // Create new div element to contain SVG
            var frame = d3.select(element).append('div').attr({style: KineticGraphs.positionByPixelCoordinates({x:0,y:0})});

            // Create new SVG element for the graph visualization
            var svg = frame.append("svg")
                .attr("width", dimensions.width)
                .attr("height", dimensions.height);

            // Add a div above the SVG for labels and controls
            graph.divs = frame.append('div').attr({style: KineticGraphs.positionByPixelCoordinates({x:margins.left,y:margins.top})});

            // Establish SVG groups for visualization area (vis), mask, axes
            graph.vis = svg.append("g").attr("transform", visTranslation);
            var mask = svg.append("g").attr("class","mask");
            var axes = svg.append("g").attr("class","axes").attr("transform", visTranslation);

            // Put mask around vis to clip objects that extend beyond the desired viewable area
            mask.append("rect").attr({x: 0, y: 0, width: dimensions.width, height: margins.top});
            mask.append("rect").attr({x: 0, y: dimensions.height - margins.bottom, width: dimensions.width, height: margins.bottom});
            mask.append("rect").attr({x: 0, y: 0, width: margins.left, height: dimensions.height});
            mask.append("rect").attr({x: dimensions.width - margins.right, y: 0, width: margins.right, height: dimensions.height});

            // Establish SVG group for axes

            // Establish dimensions of axes (element dimensions minus margins)
            var axisDimensions = {
                width: dimensions.width - margins.left - margins.right,
                height: dimensions.height - margins.top - margins.bottom
            };

            // draw axes
            graph.xAxis.draw(axes,axisDimensions);
            graph.yAxis.draw(axes,axisDimensions);

            return graph;

        }

        drawObjects() {

            var graph = this,
                definition = this.definition;

            if(!graph.graphObjects || graph.graphObjects == undefined) {
                graph.graphObjects = new GraphObjects(definition.graphObjects);
            }

            // Update graphObject graph objects based on change in scope
            graph = graph.graphObjects.update(definition.graphObjects).render(graph);

            return graph;

        }

    }

}

