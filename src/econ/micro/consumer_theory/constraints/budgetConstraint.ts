/// <reference path="../../../eg.ts"/>

module EconGraphs {

    export interface BudgetConstraintDefinition extends KG.ModelDefinition {
        budgetSegmentDefinitions: BudgetSegmentDefinition[];
        budgetConstraintLabel: string;
        budgetSetLabel: string;
        xInterceptLabel: string;
        yInterceptLabel: string;
    }

    export interface IBudgetConstraint extends KG.IModel {

        budgetSegments: BudgetSegment[];
        isAffordable: (bundle:KG.ICoordinates) => boolean;
        budgetConstraintLabel: string;
        budgetSetLabel: string;
        xInterceptLabel: string;
        yInterceptLabel: string;
        xValue: (y:number) => number;
        yValue: (x:number) => number;
    }

    export class BudgetConstraint extends KG.Model implements IBudgetConstraint {

        public budgetSegments;
        public budgetConstraintLabel;
        public budgetSetLabel;
        public xInterceptLabel;
        public yInterceptLabel;

        constructor(definition:BudgetConstraintDefinition, modelPath?:string) {
            super(definition, modelPath);
        }

        _update(scope) {
            var b = this;
            b.budgetSegments.forEach(function(bs) {bs.update(scope)});
            return b;
        }

        isAffordable(bundle) {
            var b = this;
            for(var i = 0; i < b.budgetSegments.length; i++) {
                var bs = b.budgetSegments[i];
                if(bs.isAffordable(bundle)) {
                    return true;
                }
            }
            return false;
        }

        xValue(y) {
            var x = 0;
            this.budgetSegments.forEach(function(segment){
                if(segment.yDomain.contains(y)) {
                    x = segment.linear.xValue(y);
                }
            });
            return x;
        }

        yValue(x) {
            var y = 0;
            this.budgetSegments.forEach(function(segment){
                if(segment.xDomain.contains(x)) {
                    y = segment.linear.yValue(x);
                }
            });
            return y;
        }
    }
}