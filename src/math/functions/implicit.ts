module KGMath.Functions {

    export interface ImplicitDefinition {
        xFunctionType: string;
        xFunctionDef: BaseDefinition;
        yFunctionType: string;
        yFunctionDef: BaseDefinition;
        tDomainDef: KG.DomainDef;
    }

    export interface IImplicit extends KG.IModel {
        xFunction: Base;
        yFunction: Base;
        tDomain: KG.Domain;
        point: (t:number) => KG.ICoordinates;
        slopeBetweenPoints: (t1: number, t2: number, inverse?:boolean) => number;
        points: (graph:KG.Graph, numSamplePoints?:number) => KG.ICoordinates[];
    }

    export class Implicit extends KG.Model implements IImplicit {

        public xFunction;
        public yFunction;
        public tDomain;

        constructor(definition:ImplicitDefinition,modelPath?) {
            super(definition,modelPath);

            var fn = this;
            fn.xFunction = new KGMath.Functions[definition.xFunctionType](definition.xFunctionDef, fn.modelProperty('xFunction'));
            fn.yFunction = new KGMath.Functions[definition.yFunctionType](definition.yFunctionDef, fn.modelProperty('yFunction'));
            fn.tDomain = new KG.Domain(definition.tDomainDef.min, definition.tDomainDef.max);

        }

        _update(scope) {
            var fn = this;
            fn.xFunction.update(scope);
            fn.yFunction.update(scope);
            fn.tDomain.update(scope);
            return fn;
        }

        point(t:number) {
            var fn = this;
            return {
                x: fn.xFunction.yValue(t),
                y: fn.yFunction.yValue(t)
            }
        }

        // Returns the slope between (x(t1), y(t1)) and (x(t2),y(t2)).
        // If inverse = true, return 1 / that slope.
        slopeBetweenPoints(t1,t2,inverse) {

            var p1 = this.point(t1),
                p2 = this.point(t2);

            inverse = inverse || false;

            var s = (p1.y - p2.y)/(p1.x - p2.x);

            return inverse ? 1/s : s;
        }

        points(view:KG.Graph, numSamplePoints) {

            var fn = this,
                points = [];

            numSamplePoints = numSamplePoints || 51;

            var samplePoints = fn.tDomain.samplePoints(numSamplePoints);

            for(var i = 0; i < numSamplePoints; i++) {

                var previousPoint = (i > 0) ? fn.point(samplePoints[i-1]) : null,
                    point = fn.point(samplePoints[i]),
                    nextPoint = (i < numSamplePoints - 1) ? fn.point(samplePoints[i+1]) : null;

                if(view.onGraph(point) || view.onGraph(previousPoint) || view.onGraph(nextPoint)) {
                    points.push(point);
                }
            }

            return points;

        }
    }

}