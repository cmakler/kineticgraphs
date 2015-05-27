'use strict';

module Sample {

    export interface SinglePointDefinition extends KineticGraphs.ModelDefinition
    {
        name: string;
        x: any;
        y: any;
        xDrag: boolean;
        yDrag: boolean;
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
        point: () => KineticGraphs.Point;
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
                xDrag: definition.xDrag,
                yDrag: definition.yDrag,
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

    export interface ITwoPoints extends KineticGraphs.IModel
    {
        segment:() => KineticGraphs.Segment;
    }

    export class TwoPoints extends KineticGraphs.Model implements ITwoPoints
    {
        public point1:SinglePoint;
        public point2:SinglePoint;
        private s:KineticGraphs.Segment;

        constructor(definition) {
            super(definition)
            this.s = new KineticGraphs.Segment({
                name: 'twoPointSegment',
                a: {x: definition.point1.definition.x, y: definition.point1.definition.y},
                b: {x: definition.point2.definition.x, y: definition.point2.definition.y},
            })
        }

        segment() {
            return this.s;
        }


    }

}