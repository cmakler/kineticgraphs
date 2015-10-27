/// <reference path="../../../eg.ts"/>

module EconGraphs {

    export interface OneGoodUtilityDefinition extends UtilityDefinition
    {
        marginalCurveLabel?: string;
        marginalSlopeCurveLabel?: string;
    }

    export interface IOneGoodUtility extends IUtility
    {
        marginalUtilityFunction: KGMath.Functions.Base;

        utilityAtQuantity: (quantity:number) => number;
        consumptionYieldingUtility: (utility:number) => number;
        utilityAtQuantityPoint: (quantity:number, params?:KG.PointParamsDefinition) => KG.Point;

        utilityFunctionView: KG.Curve;
        marginalUtilityFunctionView: KG.Curve;
        marginalUtilitySlopeView: (quantity:number, params?:KG.LineParamsDefinition) => KG.Line;
    }

    export class OneGoodUtility extends Utility implements IOneGoodUtility
    {

        public marginalUtilityFunction;

        public curveLabel;
        public marginalCurveLabel;
        public marginalSlopeCurveLabel;

        public utilityFunctionView;
        public marginalUtilityFunctionView;
        public marginalUtilitySlopeView;

        constructor(definition:OneGoodUtilityDefinition, modelPath?:string) {

            definition = _.defaults(definition,{
                curveLabel: 'u(c)',
                marginalCurveLabel: 'u\'(c)'
            });
            super(definition, modelPath);

            this.utilityFunctionView = new KG.FunctionPlot({
                name: 'utilityFunction',
                className: 'utility',
                fn: this.modelProperty('utilityFunction'),
                arrows: 'NONE',
                label: {
                    text: this.curveLabel
                },
                numSamplePoints: 501
            });

            if(this.utilityFunction.derivative()) {
                this.marginalUtilityFunction = this.utilityFunction.derivative();
                this.marginalUtilityFunctionView = new KG.FunctionPlot({
                    name: 'marginalUtilityFunction',
                    className: 'demand',
                    fn: this.modelProperty('marginalUtilityFunction'),
                    arrows: 'NONE',
                    label: {
                        text: this.marginalCurveLabel
                    },
                    numSamplePoints: 501
                })
            }


        }

        _update(scope) {
            var u = this;
            u.utilityFunction.update(scope);
            if(this.utilityFunction.derivative()) {
                this.marginalUtilityFunction.update(scope);
            }
            return u;
        }

        utilityAtQuantity(c) {
            return this.utilityFunction.yValue(c)
        }

        marginalUtilityAtQuantity(c) {
            return this.marginalUtilityFunction.yValue(c)
        }

        marginalUtilityAtQuantitySlope(c, params) {
            return new KG.Line({
                name: 'marginalUtilityAtQuantitySlope',
                className: 'demand dotted',
                lineDef: {
                    point: {x: c, y: this.utilityAtQuantity(c)},
                    slope: this.marginalUtilityAtQuantity(c)
                },
                params: params
            });
        }

        utilityAtQuantityPoint(q, params: KG.PointParamsDefinition) {
            return new KG.Point({
                coordinates: {x: q, y: this.utilityAtQuantity(q)},
                name: 'utilityAtQ',
                className: 'utility',
                params: params
            })
        }

        marginalUtilityAtQuantityPoint(q, params?) {
            return new KG.Point({
                name: 'marginalUtilityAtQ',
                coordinates: {x: q, y: this.marginalUtilityFunction.yValue(q)},
                className: 'demand',
                params: params
            })
        }

        consumptionYieldingUtility(u) {
            return this.utilityFunction.xValue(u);
        }

    }

}