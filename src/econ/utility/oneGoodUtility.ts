/// <reference path="../eg.ts"/>

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
        utilityAtQuantityPoint: (quantity:number, label?: string, dragParam?: string) => KG.Point;

        utilityFunctionView: KG.Curve;
        marginalUtilityFunctionView: KG.Curve;
        marginalUtilitySlopeView: (name:string, quantity:number) => KG.Line;
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
                className: this.className,
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
                    className: this.className,
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

        marginalUtilityAtQuantitySlope(c, slopeLineParams: {id?: string; label?:string;}) {
            return new KG.Line({
                name: 'slopeLine_' + slopeLineParams.id,
                className: 'demand dotted',
                lineDef: {
                    point: {x: c, y: this.utilityAtQuantity(c)},
                    slope: this.marginalUtilityAtQuantity(c)
                },
                label: {
                    text: "\\text{slope} = " + slopeLineParams.label
                }
            });
        }

        utilityAtQuantityPoint(q, pointParams: {id?: string; label?:string; xAxisLabel?:string; yAxisLabel?:string; className?:string; dragParam?:string}) {
            return new KG.Point({
                name: 'utilityAtQ_' + pointParams.id,
                coordinates: {x: q, y: this.utilityAtQuantity(q)},
                size: 500,
                class: pointParams.className || 'utility',
                xDrag: pointParams.dragParam,
                label: {
                    text: label
                },
                droplines: {
                    vertical: 'c' + labelSubscript,
                    horizontal: 'u(c'+ labelSubscript +')'
                }
            })
        }

        marginalUtilityAtQuantityPoint(q, label?, dragParam?) {
            var labelSubscript = label ? '_{' + label + '}' : '';
            return new KG.Point({
                name: 'marginalUtilityAtQ' + label,
                coordinates: {x: q, y: this.marginalUtilityFunction.yValue(q)},
                size: 500,
                class: 'utility',
                xDrag: dragParam,
                label: {
                    text: label
                },
                droplines: {
                    horizontal: 'u\'(c'+ labelSubscript +')'
                }
            })
        }

        consumptionYieldingUtility(u) {
            return this.utilityFunction.xValue(u);
        }

    }

}