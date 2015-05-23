/**
 * Created by cmakler on 5/21/15.
 */

module Sample {

    export interface SinglePointDefinition extends KineticGraphs.ModelDefinition
    {
        name: string;
        x: any;
        y: any;
        size?: number;
        symbol?: string;
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
        private c: KineticGraphs.ControlDiv;

        constructor(definition:SinglePointDefinition) {
            super(definition);
            this.c = new KineticGraphs.ControlDiv({
                name: definition.name+'control',
                coordinates: {x: definition.x, y: definition.y},
                text:'A'})
            this.p = new KineticGraphs.Point({
                name: definition.name+'point',
                coordinates: {x: definition.x, y:definition.y},
                size: definition.size,
                symbol: definition.symbol
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

        controlDiv(){
            var c = this.c;
            c.xParam = 'x';
            c.yParam = 'y';
            c.coordinates = this.coordinates();
            return c;
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