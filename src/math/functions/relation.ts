module KGMath.Functions {

    export interface RelationDefinition {
        functionType: string;
        functionDef: BaseDefinition;
        inverse?: boolean;
    }

    export interface IRelation extends KG.IModel {
        fn: Base;
        slopeBetweenPoints: (t1: number, t2: number, inverse?:boolean) => number;
        points: (graph:KG.Graph, numSamplePoints?:number) => KG.ICoordinates[];
    }

    export class Relation extends KG.Model implements IRelation {

        public fn;
        public inverse;

        constructor(definition:RelationDefinition,modelPath?:string) {
            definition.inverse = definition.inverse || false;
            super(definition,modelPath);

            var f = this;
            f.fn = new KGMath.Functions[definition.functionType](definition.functionDef, f.modelProperty('fn'));
        }

        // Returns the slope between (a,f(a)) and (b,f(b)).
        // If inverse = true, returns the slope between (f(a),a) and (f(b),b).
        // Assumes that a and b are both scalars (for now).
        slopeBetweenPoints(a,b,inverse) {

            var f = this;

            b = b || 0;
            inverse = inverse || false;

            var s = (f.fn.yValue(a) - f.fn.yValue(b))/(a - b);

            return (inverse != f.inverse) ? 1/s : s;
        }

        points(view, numSamplePoints) {

            var f = this,
                points = [];

            numSamplePoints = numSamplePoints || 51;

            var independentAxis = f.inverse ? view.yAxis : view.xAxis,
                sampleIndependentValues = independentAxis.domain.samplePoints(numSamplePoints),
                sampleDependentValues = sampleIndependentValues.map(f.fn.yValue);

            for(var i = 0; i < numSamplePoints; i++) {

                var point, previousPoint, nextPoint;

                if(f.inverse) {
                    previousPoint = (i > 0) ? {x: sampleDependentValues[i-1], y: sampleIndependentValues[i-1]} : null;
                    point = {x: sampleDependentValues[i], y: sampleIndependentValues[i]};
                    nextPoint = (i < numSamplePoints - 1) ? {x: sampleDependentValues[i+1], y: sampleIndependentValues[i+1]} : null;
                } else {
                    previousPoint = (i > 0) ? {x: sampleIndependentValues[i-1],y: sampleDependentValues[i-1]} : null;
                    point = {x: sampleIndependentValues[i], y: sampleDependentValues[i]};
                    nextPoint = (i < numSamplePoints - 1) ? {x: sampleIndependentValues[i+1],y: sampleDependentValues[i+1]} : null;
                }
                if(view.onGraph(point) || view.onGraph(previousPoint) || view.onGraph(nextPoint)) {
                    points.push(point)
                }

            }

           return points;

        }
    }

}