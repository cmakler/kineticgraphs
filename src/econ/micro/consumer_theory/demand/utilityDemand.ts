/// <reference path="../../../eg.ts"/>

module EconGraphs {

    export interface UtilityDemandCurveParams extends KG.DomainSamplePointsDef {
        good: string;
    }

    export interface UtilityDemandDefinition extends KG.ModelDefinition
    {
        utility: {type: string; definition: TwoGoodUtilityDefinition}
    }

    export interface IUtilityDemand extends KG.IModel
    {
        utility: TwoGoodUtility;

        quantityAtPrice: (price:number, good?: string) => number;
        quantityAtPricePoint: (price:number, priceParams?: any, pointParams?: KG.PointParamsDefinition) => KG.Point;
        demandCurve: (demandParams: UtilityDemandCurveParams, curveParams: KG.CurveParamsDefinition) => KG.Curve;
    }

    export class UtilityDemand extends KG.Model implements IUtilityDemand
    {
        public utility;
        public optimalBundle;

        constructor(definition:UtilityDemandDefinition,modelPath?:string) {
            super(definition,modelPath);
        }

        quantityAtPrice(price:number, good?:string) {
            return 0; // overridden by subclass
        }

        quantityAtPricePoint(price, priceParams, pointParams) {
            var d = this;

            priceParams = _.defaults(priceParams,{
                good: 'x'
            });

            var quantityProperty = 'quantityAtPrice(' + price + ',' + priceParams.good + ')';

            return new KG.Point({
                name: 'q'+priceParams.good + 'd',
                className: 'demand',
                coordinates: {
                    x: d.modelProperty(quantityProperty),
                    y: price
                }
            })
        }

        demandCurve(demandParams, curveParams) {

            demandParams = _.defaults(demandParams, {
                good: 'x',
                min: 1,
                max: 50,
                numSamplePoints: 51
            });

            var d = this,
                samplePoints = KG.samplePointsForDomain(demandParams),
                curveData = [];

            samplePoints.forEach(function(price) {
                curveData.push({x: d.quantityAtPrice(price, demandParams.good), y: price});
            });

            return new KG.Curve({
                name: 'demand' + demandParams.good,
                data: curveData,
                params: curveParams,
                className: 'demand'
            });
        }

    }

}