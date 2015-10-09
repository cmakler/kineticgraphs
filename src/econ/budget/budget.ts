/**
 * Created by cmakler on 10/2/15.
 */

module EconGraphs {

    export interface BudgetDefinition extends KG.ModelDefinition {

        budgetSegmentDefinitions: BudgetSegmentDefinition[];

    }

    export interface IBudget extends KG.IModel {

        budgetSegments: BudgetSegment[];
        isAffordable: (bundle:KG.ICoordinates) => boolean;
        frontier: (graph:KG.Graph) => KG.FunctionPlot;
        feasibleSet: (graph:KG.Graph) => KG.Area;
        frontierSegments: (graph:KG.Graph) => KG.Segment[];

    }

    export class Budget extends KG.Model implements IBudget {

        public budgetSegments;

        constructor(definition:BudgetDefinition, modelPath?:string) {
            super(definition, modelPath);
        }

        isAffordable(bundle) {
            return true; // TODO update
        }

        frontier(graph) {
            return new KG.FunctionPlot({
                fn: 'foo'
            })
        }

        feasibleSet(graph) {
            return new KG.Area({

            })
        }

        frontierSegments(graph) {
            return this.budgetSegments.map(function(b) { return b.budgetSegment(graph) })
        }
    }
}