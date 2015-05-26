'use strict';

module Sample {

    export interface SinglePointDefinition extends KineticGraphs.ModelDefinition
    {
        name: string;
        x: any;
        y: any;
        xDragParam: string;
        yDragParam: string;
        size?: number;
        symbol?: string;
        label: string;
    }

    export interface ISinglePoint extends KineticGraphs.IModel
    {
        name: string;
        x: any;
        y: any;
        coordinates: () => KineticGraphs.ICoordinates;
        point(): KineticGraphs.Point;
    }

    export class SinglePoint extends KineticGraphs.Model implements ISinglePoint
    {

        public name;
        public x;
        public y;
        private p: KineticGraphs.Point;

        constructor(definition:SinglePointDefinition) {
            super(definition);
            this.p = new KineticGraphs.Point({
                name: definition.name+'point',
                coordinates: {x: definition.x, y:definition.y},
                size: definition.size,
                symbol: definition.symbol,
                xDragParam: definition.xDragParam,
                yDragParam: definition.yDragParam,
                label: definition.label
            })
        }

        coordinates(){
            return {x: this.x, y: this.y}
        }

        point(){
            var p = this.p;
            p.coordinates = this.coordinates();
            return p;
        }
    }

    export class TwoPoints extends KineticGraphs.Model
    {
        public point1:SinglePoint;
        public point2:SinglePoint;

        constructor(definition) {
            super(definition)
        }
    }

}