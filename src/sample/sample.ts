/**
 * Created by cmakler on 5/21/15.
 */

module Sample {

    export interface SinglePointDefinition extends KineticGraphs.ModelDefinition
    {
        name: string;
        x: number;
        y: number;
    }

    export interface ISinglePoint extends KineticGraphs.IModel
    {
        name: string;
        x: number;
        y: number;
        coordinates: () => KineticGraphs.ICoordinates;
        point(): KineticGraphs.Point;
    }

    export class SinglePoint extends KineticGraphs.Model
    {

        public x;
        public y;
        private p: KineticGraphs.Point;

        constructor(definition:SinglePointDefinition) {
            super(definition);
            this.p = new KineticGraphs.Point({name: definition.name, coordinates: {x: definition.x, y: definition.y}})
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