/// <reference path="../eg.ts"/>

module EconGraphs {

    export interface OneGoodUtilityDefinition extends KG.ModelDefinition
    {
        type?: string;
        def?: KGMath.Functions.BaseDefinition;
        className?: string;
        curveLabel?: string;
        marginalCurveLabel?: string;
        marginalSlopeCurveLabel?: string;
    }

    export interface IOneGoodUtility extends KG.IModel
    {
        utilityFunction: KGMath.Functions.Base;
        marginalUtilityFunction: KGMath.Functions.Base;

        utilityAtQuantity: (quantity:number, label?: string, dragParam?: string) => KG.Point;

        utilityFunctionView: KG.Curve;
        marginalUtilityFunctionView: KG.Curve;
        marginalUtilitySlopeView: (name:string, quantity:number) => KG.Line;
    }

    export class OneGoodUtility extends KG.Model implements IOneGoodUtility
    {

        public className;
        public utilityFunction;
        public marginalUtilityFunction;

        public curveLabel;
        public marginalCurveLabel;
        public marginalSlopeCurveLabel;

        public utilityFunctionView;
        public marginalUtilityFunctionView;
        public marginalUtilitySlopeView;

        constructor(definition:OneGoodUtilityDefinition, modelPath?:string) {

            definition = _.defaults(definition,{
                className: 'utility',
                curveLabel: 'u(c)',
                marginalCurveLabel: 'u\'(c)'
            });
            super(definition, modelPath);
            this.utilityFunction = new KGMath.Functions[definition.type](definition.def);

            this.utilityFunctionView = new KG.FunctionPlot({
                name: 'utilityFunction',
                className: this.className,
                fn: 'model.utilityFunction',
                arrows: 'NONE',
                label: {
                    text: this.curveLabel
                }
            });

            if(this.utilityFunction.derivative()) {
                this.marginalUtilityFunction = this.utilityFunction.derivative();
                this.marginalUtilityFunctionView = new KG.FunctionPlot({
                    name: 'marginalUtilityFunction',
                    className: this.className,
                    fn: 'model.marginalUtilityFunction',
                    arrows: 'NONE',
                    label: {
                        text: this.marginalCurveLabel
                    }
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


        marginalUtilityAtQuantitySlope(q, label?) {
            var labelSubscript = label ? '_{' + label + '}' : '';
            return new KG.Line({
                name: 'slopeLine',
                type: 'PointSlopeLine',
                className: 'demand dotted',
                def: {
                    p: {x: q, y: this.utilityAtQuantity(q)},
                    m: this.marginalUtilityAtQuantity(q)
                },
                label: {
                    text: 'u\'(c'+ labelSubscript +')'
                }
            });
        }

        utilityAtQuantityPoint(q, label?, dragParam?) {
            var labelSubscript = label ? '_{' + label + '}' : '';
            return new KG.Point({
                name: 'utilityAtQ',
                coordinates: {x: q, y: this.utilityAtQuantity(q)},
                size: 500,
                class: 'utility',
                xDrag: dragParam,
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
                name: 'marginalUtilityAtQ',
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

    }

}