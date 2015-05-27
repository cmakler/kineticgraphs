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
        point: KineticGraphs.Point;
    }

    export class SinglePoint extends KineticGraphs.Model implements ISinglePoint
    {

        public name;
        public x;
        public y;
        public point: KineticGraphs.Point;

        constructor(definition:SinglePointDefinition) {
            super(definition);
            this.point = new KineticGraphs.Point({
                name: definition.name+'point',
                coordinates: {x: definition.x, y:definition.y},
                size: definition.size,
                symbol: definition.symbol,
                xDrag: definition.xDrag,
                yDrag: definition.yDrag,
                label: definition.label
            })
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
                a: definition.point1,
                b: definition.point2,
            })
        }

        segment() {
            return this.s;
        }


    }

}