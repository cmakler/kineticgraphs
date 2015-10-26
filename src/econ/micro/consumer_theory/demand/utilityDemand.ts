/// <reference path="../../../eg.ts"/>

module EconGraphs {

    export interface UtilityDemandCurveParams extends KG.DomainSamplePointsDef {
        good: string;
    }

    export interface UtilityDemandDefinition extends KG.ModelDefinition
    {
        utility: {type: string; definition: TwoGoodUtilityDefinition};
    }

    export interface IUtilityDemand extends KG.IModel
    {
        utility: TwoGoodUtility;
        utilitySelector: KG.Selector;

        quantityAtPrice: (price:number, good?: string) => number;
        quantityAtPricePoint: (price:number, priceParams?: any, pointParams?: KG.PointParamsDefinition) => KG.Point;
        demandCurve: (demandParams: UtilityDemandCurveParams, curveParams: KG.CurveParamsDefinition) => KG.Curve;
    }

    export class UtilityDemand extends KG.Model implements IUtilityDemand
    {
        public utility;
        public utilitySelector;
        public optimalBundle;

        constructor(definition:UtilityDemandDefinition,modelPath?:string) {

            super(definition,modelPath);
        }

        quantityAtPrice(price:number, good?:string) {
            return 0; // overridden by subclass
        }

        otherQuantityAtPrice(price:number, good?:string) {
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
                },
                params: pointParams
            })
        }

        quantitiesAtPriceSegment(price, segmentParams) {
            var d = this;

            segmentParams = _.defaults(segmentParams,{
                good: 'x'
            });

            var quantityProperty = 'quantityAtPrice(' + price + ',' + segmentParams.good + ')';
            var otherQuantityProperty = 'otherQuantityAtPrice(' + price + ',' + segmentParams.good + ')';

            return new KG.Segment({
                name: 'q'+segmentParams.good + 'dSegment',
                className: 'demand',
                a: {
                    x: d.modelProperty(quantityProperty),
                    y: price
                },
                b: {
                    x: d.modelProperty(otherQuantityProperty),
                    y: price
                },
                params: segmentParams
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

            curveData = curveData.sort(KG.sortObjects('x'));

            return new KG.Curve({
                name: 'demand' + demandParams.good,
                data: curveData,
                params: curveParams,
                className: 'demand'
            });
        }

    }

}