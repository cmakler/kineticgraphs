'use strict';

module Sample {

    export interface SinglePointDefinition extends KG.ModelDefinition
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

    export interface ISinglePoint extends KG.IModel
    {
        name: string;
        x: any;
        y: any;
        point: KG.Point;
    }

    export class SinglePoint extends KG.Model implements ISinglePoint
    {

        public name;
        public x;
        public y;
        public point: KG.Point;

        constructor(definition:SinglePointDefinition) {
            super(definition);
            this.point = new KG.Point({
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

    export interface ITwoPoints extends KG.IModel
    {
        segment:() => KG.Segment;
    }

    export class TwoPoints extends KG.Model implements ITwoPoints
    {
        public point1:SinglePoint;
        public point2:SinglePoint;
        private s:KG.Segment;

        constructor(definition) {
            super(definition)
            this.s = new KG.Segment({
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