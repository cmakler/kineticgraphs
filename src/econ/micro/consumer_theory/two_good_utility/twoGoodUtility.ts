/// <reference path="../../../eg.ts"/>

'use strict';

module EconGraphs {

    export interface TwoGoodBundle extends KG.ICoordinates {

    }

    export interface TwoGoodUtilityDefinition extends UtilityDefinition {

    }

    export interface ITwoGoodUtility extends IUtility {

        title: string;
        formula: (values:boolean) => string;

        utility:(bundle?:TwoGoodBundle) => number;
        mux:(bundle?:TwoGoodBundle) => number;
        muy:(bundle?:TwoGoodBundle) => number;
        mrs:(bundle?:TwoGoodBundle) => number;

        bundlePoint: (bundle: TwoGoodBundle, params?: KG.PointParamsDefinition) => KG.Point;

        indifferenceCurveAtUtility: (utility:number, params?: KG.CurveParamsDefinition) => KG.ViewObject;
        indifferenceCurveThroughBundle: (bundle:TwoGoodBundle, params?: KG.CurveParamsDefinition) => KG.ViewObject;
        indifferenceCurveFamily: (levels: number[], params?: KG.CurveParamsDefinition) => KG.ViewObjectGroup;

        mrsLine: (bundle:TwoGoodBundle, params?: KG.LineParamsDefinition) => KG.Line;

        //preferredToBundleArea: (bundle:TwoGoodBundle) => KG.Area;
        //dispreferredToBundleArea: (bundle:TwoGoodBundle) => KG.Area;
        //higherUtilityArea: (utility:number) => KG.Area;
        //lowerUtilityArea: (utility:number) => KG.Area;

        _unconstrainedOptimalX:(budgetSegment:BudgetSegment) => number;
        optimalBundle:(budget:BudgetConstraint) => KG.ICoordinates;
        optimalBundleAlongSegment:(budgetSegment:BudgetSegment) => KG.ICoordinates;
        optimalBundlePoint: (budget: BudgetConstraint, params?: KG.PointParamsDefinition) => KG.Point;
        optimalIndifferenceCurve: (budget: BudgetConstraint, params?: KG.CurveParamsDefinition) => KG.ViewObject;
        indirectUtility: (budget: BudgetConstraint) => number;

        lowestCostBundle: (utility:UtilityConstraint) => KG.ICoordinates;
        lowestCostBundlePoint: (utility:UtilityConstraint, params?: KG.PointParamsDefinition) => KG.Point;
        expenditure: (utility:UtilityConstraint) => number;

    }

    export class TwoGoodUtility extends Utility implements ITwoGoodUtility {

        public title;

        constructor(definition:TwoGoodUtilityDefinition, modelPath?:string) {

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

        /* Pure preferences */

        // Given two bundles, evaluates whether agent prefers first or second, or is indifferent
        bundlePreferred(bundles:TwoGoodBundle[], tolerance?:number) {

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

        /* Utility measures */

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

        mrsLine(bundle, params) {
            var u = this;
            return new KG.Line({
                name: 'mrsLine',
                point: bundle,
                slope: -1 * u.mrs(bundle),
                params: params
            })
        }

        bundlePoint(bundle, params) {
            return new KG.Point({
                coordinates: {x: bundle.x, y: bundle.y},
                name: 'bundlePoint',
                className: 'utility',
                params: params
            })
        }

        /* Indifference curves */

        indifferenceCurveAtUtility(utility:number, params: KG.CurveParamsDefinition, map?:boolean) {
            var u = this,
                originalLevel = u.utilityFunction.level;
            var clone = _.clone(u.utilityFunction);
            var indifferenceCurve = new KG.FunctionPlot({
                name: 'indifferenceCurve',
                fn: clone.setLevel(utility),
                className: map ? 'dataPathFamily' : 'utility',
                params: params
            });
            u.utilityFunction.setLevel(originalLevel);
            return indifferenceCurve;
        }

        indifferenceCurveThroughBundle(bundle:TwoGoodBundle, params: KG.CurveParamsDefinition) {
            var u = this,
                utility = u.utility(bundle);
            return u.indifferenceCurveAtUtility(utility,params);
        }

        indifferenceCurveFamily(levels:number[], params: KG.CurveParamsDefinition) {
            var u = this;

            var indifferenceCurves = [];

            params = _.defaults(params,{
                name: 'map'
            });

            levels.forEach(function(level) {
                params.objectName = "U" + level;
                params.label = "U_{" + level + "}";
                indifferenceCurves.push(u.modelProperty("indifferenceCurveAtUtility("+level+","+JSON.stringify(params)+",true)"));
            });

            return new KG.ViewObjectGroup({name: 'indifferenceCurve_'+params.name, viewObjects: indifferenceCurves});

        }

        /* Utility maximization subject to a budget constraint */

        _unconstrainedOptimalX(budgetSegment:BudgetSegment) {
            return 0; // based on specific utility function; overridden by subclass
        }

        optimalBundle(budget:BudgetConstraint) {
            var u = this;
            var candidateBundles: TwoGoodBundle[] = budget.budgetSegments.map(function(segment) { return u.optimalBundleAlongSegment(segment)});
            var maxUtilityBundle = candidateBundles[0];
            candidateBundles.forEach(function(bundle) {
                if(u.utility(bundle) > u.utility(maxUtilityBundle)) {
                    maxUtilityBundle = bundle;
                }
            });
            return maxUtilityBundle;
        }

        optimalBundleAlongSegment(budgetSegment:BudgetSegment) {
            var u = this;
            var constrainedX, unconstrainedX;
            unconstrainedX = u._unconstrainedOptimalX(budgetSegment);
            constrainedX = budgetSegment.xDomain.closestValueTo(unconstrainedX);
            return {x: constrainedX, y: budgetSegment.linear.yValue(constrainedX)};
        }

        optimalBundlePoint(budget:BudgetConstraint, params:KG.PointParamsDefinition) {
            var optimalBundle = this.optimalBundle(budget);
            return this.bundlePoint(optimalBundle,params)
        }

        optimalIndifferenceCurve(budget:BudgetConstraint, params:KG.CurveParamsDefinition) {
            var optimalBundle = this.optimalBundle(budget);
            return this.indifferenceCurveThroughBundle(optimalBundle,params);
        }

        indirectUtility(budget:BudgetConstraint) {
            var u = this;
            return u.utility(u.optimalBundle(budget));
        }

        /* Cost minimization */

        lowestCostBundle(utility:UtilityConstraint) {
            return {x: null, y: null}; // based on specific utility function; overridden by subclass
        }

        lowestCostBundlePoint(utility:UtilityConstraint, params:KG.PointParamsDefinition) {
            var lowestCostBundle = this.lowestCostBundle(utility);
            return this.bundlePoint(lowestCostBundle,params)
        }

        expenditure(utility:UtilityConstraint) {
            var lowestCostBundle = this.lowestCostBundle(utility);
            return utility.px*lowestCostBundle.x + utility.py*lowestCostBundle.y
        }

        formula(values) {
            return ''; // overridden by subclass
        }



    }
}

