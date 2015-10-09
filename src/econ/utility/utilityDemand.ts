/// <reference path="../eg.ts"/>

module EconGraphs {

    export interface UtilityDemandDefinition extends KG.ModelDefinition
    {
        utilityFnDef: {utilityType: string; utilityDef: UtilityDefinition;};
        otherPrice: any;
        demandForY: any;
    }

    export interface IUtilityDemand extends KG.IModel
    {
        utilityFunction: TwoGoodUtility;
        otherPrice: number;
        demandForY: boolean;
        demandFunction: KGMath.Functions.Base;
        demandCurve: KG.FunctionPlot;
        quantityAtPrice: (price:number) => number;
        quantityAtPricePoint: (price:number) => KG.Point;
    }

    export class UtilityDemand extends KG.Model implements IHicksianDemand
    {

        constructor(definition:UtilityDemandDefinition,modelPath?:string) {

            super(definition,modelPath);

            var d = this;

            d.utilityFunction = new Econgraphs[definition.utilityFnDef.utilityType](definition.utilityFnDef.utilityDef, d.modelProperty('utilityFn'));

            d.demandCurve = new KG.FunctionPlot({
                fn: d.modelProperty('demandFunction'),
                yIsIndependent: true
            })

        }

        _update(scope) {
            var m = this;
            m.utilityFunction.update(scope);
            return m;
        }

    }

}