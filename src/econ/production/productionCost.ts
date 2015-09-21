/// <reference path="../eg.ts"/>

'use strict';

module EconGraphs {

    export interface ProductionCostDefinition extends KG.ModelDefinition
    {
        fixedCost?: any;
        costFunctionType?: string;
        costFunctionDef?: KGMath.Functions.BaseDefinition;
        marginalCostFunctionType?: string;
        marginalCostFunctionDef?: KGMath.Functions.BaseDefinition;
        fixedCostDragParam?: string;
        quantityDraggable?: boolean;
        labels?: {
            fc: string;
            vc: string;
            mc: string;
            atc: string;
            tc: string;
            avc: string;
            mcSlope: string;
            atcSlope: string;
            avcSlope: string;
        }
        show?: {
            tc: any;
            fc: any;
            vc: any;
            mc: any;
            atc: any;
            avc: any;
            mcSlope: any;
            atcSlope: any;
            avcSlope: any;
        }
    }

    export interface IProductionCost extends KG.IModel
    {
        fixedCost: number;
        costFunction: KGMath.Functions.Base;
        totalCostCurve: KG.ViewObject;
        marginalCostFunction: KGMath.Functions.Base;
        marginalCostCurve: KG.ViewObject;
        averageCostFunction: KGMath.Functions.Base;
        averageCostCurve: KG.ViewObject;
        variableCostFunction: KGMath.Functions.Base;
        variableCostCurve: KG.ViewObject;
        averageVariableCostFunction: KGMath.Functions.Base;
        averageVariableCostCurve: KG.ViewObject;
        fixedCostPoint: KG.Point;
        fixedCostLine: KG.HorizontalLine;

        tc: (q:number) => number;
        atc: (q:number) => number;
        mc: (q:number) => number;

        quantityDraggable: boolean;

        labels: {
            vc: string;
            fc: string;
            mc: string;
            atc: string;
            tc: string;
            avc: string;
            mcSlope: string;
            atcSlope: string;
            avcSlope: string;
        }
        show: {
            tc: boolean;
            vc: boolean;
            fc: boolean;
            mc: boolean;
            atc: boolean;
            avc: boolean;
            mcSlope: boolean;
            atcSlope: boolean;
            avcSlope: boolean;
        }
    }

    export class ProductionCost extends KG.Model implements IProductionCost
    {
        public costFunction;
        public totalCostCurve;
        public marginalCostFunction;
        public marginalCostCurve;
        public averageCostFunction;
        public averageCostCurve;
        public variableCostFunction;
        public variableCostCurve;
        public averageVariableCostFunction;
        public averageVariableCostCurve;
        public fixedCost;
        public fixedCostPoint;
        public fixedCostLine;
        public quantityDraggable;

        public labels;
        public show;

        constructor(definition:ProductionCostDefinition, modelPath?: string) {

            definition.labels = _.defaults(definition.labels || {},{
                tc: 'TC',
                vc: 'VC',
                fc: 'FC',
                mc: 'MC',
                atc: 'ATC',
                avc: 'AVC',
                mcSlope: 'slope = MC',
                atcSlope: 'slope = ATC',
                avcSlope: 'slope = AVC'
            });

            definition.show = _.defaults(definition.show || {},{
                tc: true,
                vc: false,
                fc: false,
                mc: true,
                atc: true,
                avc: false,
                mcSlope: false,
                atcSlope: false,
                avcSlope: false
            });

            definition = _.defaults(definition,{
                quantityDraggable: true,
            });

            super(definition,modelPath);

            var productionCost = this;

            if(definition.hasOwnProperty('costFunctionDef')) {
                productionCost.costFunction = new KGMath.Functions[definition.costFunctionType](definition.costFunctionDef);
                productionCost.marginalCostFunction = productionCost.costFunction.derivative();
            } else if(definition.hasOwnProperty('marginalCostFunctionDef')) {
                productionCost.marginalCostFunction = new KGMath.Functions[definition.marginalCostFunctionType](definition.marginalCostFunctionDef, productionCost.modelProperty('marginalCostFunction'));
                productionCost.costFunction = productionCost.marginalCostFunction.integral(0,definition.fixedCost, productionCost.modelProperty('costFunction'));
            } else {
                console.log('must initiate production cost object with either total cost or marginal cost function!')
            }

            productionCost.averageCostFunction = productionCost.costFunction.average();
            productionCost.variableCostFunction = productionCost.costFunction.add(KG.subtractDefs(0,this.modelProperty('fixedCost')));
            productionCost.averageVariableCostFunction = productionCost.variableCostFunction.average();

            if(productionCost.costFunction instanceof KGMath.Functions.Linear) {
                productionCost.totalCostCurve = new KG.Line({
                    name: 'totalCostLine',
                    className: 'totalCost',
                    lineDef: {
                        slope: productionCost.modelProperty('marginalCostFunction.y'),
                        intercept: productionCost.modelProperty('fixedCost')
                    },
                    label: {
                        text: 'TC'
                    }
                });

                productionCost.marginalCostCurve = new KG.HorizontalLine({
                    name: 'marginalCostCurve',
                    className: 'marginalCost',
                    y: productionCost.modelProperty('marginalCostFunction.y'),
                    label: {
                        text: 'MC'
                    }
                });
            } else {
                productionCost.totalCostCurve = new KG.FunctionPlot({
                    name: 'totalCostCurve',
                    fn: this.modelProperty('costFunction'),
                    className: 'totalCost',
                    numSamplePoints:201,
                    label: {
                        text: 'TC'
                    }
                });

                productionCost.marginalCostCurve = new KG.FunctionPlot({
                    name: 'marginalCostCurve',
                    className: 'marginalCost',
                    fn: productionCost.modelProperty('marginalCostFunction'),
                    arrows: 'NONE',
                    label: {
                        text: 'MC'
                    },
                    numSamplePoints: 501
                });
            }

            productionCost.variableCostCurve = new KG.FunctionPlot({
                name: 'variableCostCurve',
                className: 'variableCost',
                fn: productionCost.modelProperty('variableCostFunction'),
                arrows: 'NONE',
                label: {
                    text: productionCost.modelProperty('labels.vc')
                },
                numSamplePoints: 501,
                show: productionCost.show.vc
            });

            productionCost.averageCostCurve = new KG.FunctionPlot({
                name: 'averageCostCurve',
                className: 'averageCost',
                fn: productionCost.modelProperty('averageCostFunction'),
                arrows: 'NONE',
                label: {
                    text: productionCost.modelProperty('labels.atc')
                },
                numSamplePoints: 501,
                show: productionCost.show.atc
            });

            productionCost.averageVariableCostCurve = new KG.FunctionPlot({
                name: 'averageVariableCostCurve',
                className: 'averageVariableCost',
                fn: productionCost.modelProperty('averageVariableCostFunction'),
                arrows: 'NONE',
                label: {
                    text: productionCost.modelProperty('labels.avc')
                },
                numSamplePoints: 501,
                show: productionCost.show.avc
            });



            productionCost.fixedCostPoint = new KG.Point({
                name: 'fixedCostPoint',
                className: 'totalCost',
                coordinates: {x: 0, y: productionCost.modelProperty('fixedCost')},
                droplines: {
                    horizontal: definition.labels.fc
                },
                yDrag: definition.fixedCostDragParam
            });

            productionCost.fixedCostLine = new KG.HorizontalLine({
                name: 'fixedCostLine',
                className: 'fixedCost',
                y: productionCost.modelProperty('fixedCost'),
                label: {
                    text: definition.labels.fc
                }
            });


        }

        _update(scope) {
            var p = this;
            p.costFunction.update(scope);
            p.fixedCost = p.tc(0);
            p.marginalCostFunction.update(scope);
            p.fixedCostPoint.update(scope);
            return p;
        }

        tc(q) {
            return this.costFunction.yValue(q);
        }

        vc(q) {
            return this.variableCostFunction.yValue(q);
        }

        atc(q) {
            return this.averageCostFunction.yValue(q);
        }

        avc(q) {
            return this.averageVariableCostFunction.yValue(q);
        }

        mc(q) {
            return this.marginalCostFunction.yValue(q);
        }

        marginalCostAtQuantitySlope(q, label?, dragParam?) {
            var labelSubscript = label ? '_{' + label + '}' : '',
                xDrag = this.quantityDraggable ? dragParam : false;
            return new KG.Line({
                name: 'MCslopeLine' + label,
                className: 'marginalCost dotted',
                show: this.show.mcslope,
                lineDef: {
                    point: {x: q, y: this.tc(q)},
                    slope: this.mc(q)
                },
                xDrag: xDrag,
                label: {
                    text: '\\text{slope} = MC'
                }
            });
        }

        marginalCostAtVariableCostQuantitySlope(q, label?, dragParam?) {
            var labelSubscript = label ? '_{' + label + '}' : '',
                xDrag = this.quantityDraggable ? dragParam : false;
            return new KG.Line({
                name: 'MCslopeLineVC' + label,
                className: 'marginalCost dotted',
                show: (this.show.mcslope && this.show.vc),
                lineDef: {
                    point: {x: q, y: this.modelProperty('vc('+q+')')},
                    slope: this.mc(q)
                },
                xDrag: xDrag,
                label: {
                    text: '\\text{slope} = MC'
                }
            });
        }

        averageCostAtQuantitySlope(q, label?, dragParam?) {
            var labelSubscript = label ? '_{' + label + '}' : '',
                xDrag = this.quantityDraggable ? dragParam : false;;
            return new KG.Line({
                name: 'ATCslopeLine' + label,
                className: 'averageCost dotted',
                show: this.show.atcslope,
                lineDef: {
                    point: {x: 0, y: 0},
                    slope: this.modelProperty('atc('+q+')')
                },
                xDrag: xDrag,
                label: {
                    text: '\\text{slope} = ATC'
                }
            });
        }

        averageVariableCostAtQuantitySlope(q, label?, dragParam?) {
            var labelSubscript = label ? '_{' + label + '}' : '',
                xDrag = this.quantityDraggable ? dragParam : false;;
            return new KG.Line({
                name: 'AVCslopeLine' + label,
                className: 'averageVariableCost dotted',
                show: this.show.avcslope,
                lineDef: {
                    point: {x: 0, y: 0},
                    slope: this.modelProperty('avc('+q+')')
                },
                xDrag: xDrag,
                label: {
                    text: '\\text{slope} = AVC'
                }
            });
        }

        totalCostAtQuantityPoint(q, label?, dragParam?) {
            var labelSubscript = label ? '_{' + label + '}' : '',
                xDrag = this.quantityDraggable ? dragParam : false;;
            return new KG.Point({
                name: 'totalCostAtQ' + label,
                coordinates: {x: q, y: this.modelProperty('tc('+q+')')},
                className: 'totalCost',
                xDrag: xDrag,
                label: {
                    text: label
                },
                droplines: {
                    vertical: 'q' + labelSubscript,
                    horizontal: 'TC(q'+ labelSubscript +')'
                }
            })
        }

        variableCostAtQuantityPoint(q, label?, dragParam?) {
            var labelSubscript = label ? '_{' + label + '}' : '',
                xDrag = this.quantityDraggable ? dragParam : false;;
            return new KG.Point({
                name: 'variableCostAtQ' + label,
                coordinates: {x: q, y: this.modelProperty('vc('+q+')')},
                className: 'variableCost',
                show: this.show.vc,
                xDrag: xDrag,
                label: {
                    text: label
                },
                droplines: {
                    horizontal: 'VC(q'+ labelSubscript +')'
                }
            })
        }

        marginalCostAtQuantityPoint(q, label?, dragParam?) {
            var axisLabel = this.mc(q).toFixed(1);
            if(label && label.length > 0) {
                axisLabel = label;
            }
            var axisLabel = axisLabel || this.mc(q).toFixed(1),
                mcq = this.modelProperty('mc('+q+')'),
                xDrag = this.quantityDraggable ? dragParam : false;;
            return new KG.Point({
                name: 'marginalCostAtQ' + label,
                coordinates: {x: q, y: mcq},
                className: 'marginalCost',
                xDrag: xDrag,
                droplines: {
                    horizontal: axisLabel
                }
            })
        }

        averageCostAtQuantityPoint(q, label?, dragParam?) {
            var axisLabel = this.atc(q).toFixed(1);
            if(label && label.length > 0) {
                axisLabel = label;
            }
            var atcq = this.modelProperty('atc('+q+')'),
                xDrag = this.quantityDraggable ? dragParam : false;;
            return new KG.Point({
                name: 'averageCostAtQ' + label,
                coordinates: {x: q, y: atcq},
                className: 'averageCost',
                xDrag: xDrag,
                droplines: {
                    horizontal: axisLabel
                },
                show: this.show.atc
            })
        }

        averageVariableCostAtQuantityPoint(q, label?, dragParam?) {
            var axisLabel = this.avc(q).toFixed(1);
            if(label && label.length > 0) {
                axisLabel = label;
            }
            var avcq = this.modelProperty('avc('+q+')'),
                xDrag = this.quantityDraggable ? dragParam : false;;
            return new KG.Point({
                name: 'averageVariableCostAtQ' + label,
                coordinates: {x: q, y: avcq},
                className: 'averageVariableCost',
                xDrag: xDrag,
                droplines: {
                    horizontal: axisLabel
                },
                show: this.show.avc
            })
        }



    }

}