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

        constructor(definition:BudgetDefinition, modelPath?:string) {
            super(definition, modelPath);
        }
    }
}