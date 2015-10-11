/// <reference path="../../../eg.ts"/>

module EconGraphs {

    export interface TwoGoodBundle extends KG.ICoordinates {

    }

    export interface TwoGoodUtilityDefinition extends UtilityDefinition {
        indifferenceCurveLabel: string;
    }

    export interface ITwoGoodUtility extends IUtility {

        indifferenceCurveLabel: string;

        utility:(bundle?:TwoGoodBundle) => number;
        mux:(bundle?:TwoGoodBundle) => number;
        muy:(bundle?:TwoGoodBundle) => number;
        mrs:(bundle?:TwoGoodBundle) => number;

        optimalBundle:(budget:Budget) => KG.ICoordinates;

        indifferenceCurveAtUtility: (utility:number) => KG.FunctionPlot;
        indifferenceCurveThroughBundle: (bundle:TwoGoodBundle) => KG.FunctionPlot;
        indifferenceCurveFamily: (levels: number[]) => KG.FunctionMap;

        mrsLine: (bundle:TwoGoodBundle) => KG.Line;

        //preferredToBundleArea: (bundle:TwoGoodBundle) => KG.Area;
        //dispreferredToBundleArea: (bundle:TwoGoodBundle) => KG.Area;
        //higherUtilityArea: (utility:number) => KG.Area;
        //lowerUtilityArea: (utility:number) => KG.Area;

    }

    export class TwoGoodUtility extends Utility implements ITwoGoodUtility {

        public indifferenceCurveLabel;

        constructor(definition:OneGoodUtilityDefinition, modelPath?:string) {

            definition = _.defaults(definition, {
                indifferenceCurveLabel: 'U'
            });
            super(definition, modelPath);

        }

        _update(scope) {
            var u = this;
            u.utilityFunction.update(scope);
            return u;
        }

        utility(bundle:TwoGoodBundle) {
            return this.utilityFunction.value(KG.getBases(bundle));
        }

        mux(bundle:TwoGoodBundle) {
            return this.utilityFunction.derivative(1).value(KG.getBases(bundle));
        }

        muy(bundle:TwoGoodBundle) {
            return this.utilityFunction.derivative(2).value(KG.getBases(bundle));
        }

        mrs(bundle:TwoGoodBundle) {
            return this.mux(bundle) / this.muy(bundle);
        }

        mrsLine(bundle:TwoGoodBundle) {
            var u = this;
            return new KG.Line({
                point: bundle,
                slope: -1 * u.mrs(bundle)
            })
        }

        indifferenceCurveAtUtility(utility:number) {
            var u = this;
            return new KG.FunctionPlot({
                fn: u.modelProperty('utilityFunction.setLevel('+ utility +')')
            })
        }

        indifferenceCurveThroughBundle(bundle:TwoGoodBundle) {
            var u = this,
                utility = u.utility(bundle);
            return u.indifferenceCurveAtUtility(utility);
        }

        indifferenceCurveFamily(levels:number[]) {
            var u = this;
            return new KG.FunctionMap({
                fn: u.modelProperty('utilityFunction')
            })
        }

        optimalBundle(budget:Budget) {
            return {x: 0, y: 0}
        }

        indirectUtility(budget:Budget) {
            var u = this;
            return u.utility(u.optimalBundle(budget));
        }

        // Given two bundles, evaluates whether agent prefers first or second, or is indifferent
        bundlePreferred(bundles:KG.ICoordinates[], tolerance?:number) {

            var u = this;

            tolerance = tolerance || 0.01; // percent difference within which one is thought to be indifferent


            var u1 = u.utility(bundles[0]),
                u2 = u.utility(bundles[1]),
                percentUilityDifference = (u2 - u1) / (0.5 * (u1 + u2));

            if (percentUilityDifference > tolerance) {
                return 2; //second bundle preferred
            }

            if (percentUilityDifference < -tolerance) {
                return 1; //first bundle preferred
            }

            return 0; //indifferent between two bundles

        }








    }
}

