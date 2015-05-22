/// <reference path="../kg.ts"/>

module KineticGraphs
{

    // Graph definition objects
    export interface GraphDefinition extends ViewDefinition
    {
        xAxis: AxisDefinition;
        yAxis: AxisDefinition;
        graphObjects?: ViewObjectDefinition[];
    }

    // Additions to the scope of a graph
    export interface IGraph extends IView
    {
        objectGroup: (name:string, init:((newGroup:D3.Selection) => D3.Selection)) => D3.Selection;
        getDiv: (name:string) => D3.Selection;

        // methods for handling points outside the graph area
        xOnGraph: (x:number) => boolean;
        yOnGraph: (x:number) => boolean;
        onGraph: (coordinates:ICoordinates) => boolean;

        // methods for converting model coordiantes to pixel coordinates
        pixelCoordinates: (coordinates:ICoordinates) => ICoordinates;
        dataCoordinates: (coordinateArray:ICoordinates[]) => ICoordinates[];
    }

    export class Graph extends View implements IGraph
    {
        public xAxis;
        public yAxis;
        public divs;
        public graphObjects;
        public graphDivs;

        constructor(definition:GraphDefinition) {

            // ensure dimensions and margins are set; set any missing elements to defaults
            definition.dimensions = _.defaults(definition.dimensions || {}, { width: 500, height: 500 });
            definition.margins = _.defaults(definition.margins || {}, {top: 20, left: 100, bottom: 100, right: 20});
            super(definition);


            this.xAxis = new XAxis(definition.xAxis);
            this.yAxis = new YAxis(definition.yAxis);
            this.graphDivs = [];
        }

        /*// Used to update parameters of the model from within the graph
        updateParams(params:any) {
            for (var key in params) {
                if (params.hasOwnProperty(key) && this.scope.params.hasOwnProperty(key)) {
                    this.scope.params[key] = params[key];
                }
            }
            this.scope.$apply();
        }*/

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

    }

}

