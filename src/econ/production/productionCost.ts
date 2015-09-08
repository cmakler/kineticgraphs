/// <reference path="../eg.ts"/>

'use strict';

module EconGraphs {

    export interface ProductionCostDefinition extends KG.ModelDefinition
    {
        costFunctionType?: string;
        costFunctionDef?: KGMath.Functions.BaseDefinition;
        fixedCostDragParam?: string;
    }

    export interface IProductionCost extends KG.IModel
    {
        costFunction: KGMath.Functions.Base;
        totalCostCurve: KG.ViewObject;
        marginalCostFunction: KGMath.Functions.Base;
        marginalCostCurve: KG.ViewObject;
        averageCostFunction: KGMath.Functions.Base;
        averageCostCurve: KG.ViewObject;
        fixedCost: number;
        fixedCostPoint: KG.Point;

        tc: (q:number) => number;
        atc: (q:number) => number;
        mc: (q:number) => number;
    }

    export class ProductionCost extends KG.Model implements IProductionCost
    {
        public costFunction;
        public totalCostCurve;
        public marginalCostFunction;
        public marginalCostCurve;
        public averageCostFunction;
        public averageCostCurve;
        public fixedCost;
        public fixedCostPoint;

        constructor(definition:ProductionCostDefinition) {
            super(definition);

            var productionCost = this;

            productionCost.costFunction = new KGMath.Functions[definition.costFunctionType](definition.costFunctionDef);
            productionCost.totalCostCurve = new KG.FunctionPlot({
                name: 'totalCostCurve',
                fn: this.modelProperty('costFunction'),
                className: 'totalCost',
                numSamplePoints:201,
                label: {
                    text: 'TC'
                }
            });

            productionCost.marginalCostFunction = productionCost.costFunction.derivative();
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

            productionCost.averageCostFunction = productionCost.costFunction.average();
            productionCost.averageCostCurve = new KG.FunctionPlot({
                name: 'averageCostCurve',
                className: 'averageCost',
                fn: productionCost.modelProperty('averageCostFunction'),
                arrows: 'NONE',
                label: {
                    text: 'AC'
                },
                numSamplePoints: 501
            });

            productionCost.fixedCostPoint = new KG.Point({
                name: 'fixedCostPoint',
                className: 'totalCost',
                coordinates: {x: 0, y: productionCost.modelProperty('fixedCost')},
                droplines: {
                    horizontal: 'FC'
                },
                yDrag: definition.fixedCostDragParam
            })


        }

        _update(scope) {
            var p = this;
            p.fixedCost = p.tc(0);
            return p;
        }

        tc(q) {
            return this.costFunction.yValue(q);
        }

        atc(q) {
            return this.averageCostFunction.yValue(q);
        }

        mc(q) {
            return this.marginalCostFunction.yValue(q);
        }

        marginalCostAtQuantitySlope(q, label?) {
            var labelSubscript = label ? '_{' + label + '}' : '';
            return new KG.Line({
                name: 'MCslopeLine' + label,
                className: 'marginalCost dotted',
                lineDef: {
                    point: {x: q, y: this.tc(q)},
                    slope: this.mc(q)
                },
                label: {
                    text: '\\text{slope} = MC(q'+ labelSubscript +')'
                }
            });
        }

        averageCostAtQuantitySlope(q, label?) {
            var labelSubscript = label ? '_{' + label + '}' : '';
            return new KG.Line({
                name: 'ATCslopeLine' + label,
                className: 'averageCost dotted',
                lineDef: {
                    point: {x: 0, y: 0},
                    slope: this.atc(q)
                },
                label: {
                    text: '\\text{slope} = AC(q'+ labelSubscript +')'
                }
            });
        }

        totalCostAtQuantityPoint(q, label?, dragParam?) {
            var labelSubscript = label ? '_{' + label + '}' : '';
            return new KG.Point({
                name: 'totalCostAtQ' + label,
                coordinates: {x: q, y: this.tc(q)},
                className: 'totalCost',
                xDrag: dragParam,
                label: {
                    text: label
                },
                droplines: {
                    vertical: 'q' + labelSubscript,
                    horizontal: 'TC(q'+ labelSubscript +')'
                }
            })
        }

        marginalCostAtQuantityPoint(q, label?, dragParam?) {
            var labelSubscript = label ? '_{' + label + '}' : '';
            return new KG.Point({
                name: 'marginalCostAtQ' + label,
                coordinates: {x: q, y: this.mc(q)},
                className: 'marginalCost',
                xDrag: dragParam,
                label: {
                    text: label
                },
                droplines: {
                    horizontal: 'MC(q'+ labelSubscript +')'
                }
            })
        }

        averageCostAtQuantityPoint(q, label?, dragParam?) {
            var labelSubscript = label ? '_{' + label + '}' : '';
            return new KG.Point({
                name: 'averageCostAtQ' + label,
                coordinates: {x: q, y: this.atc(q)},
                className: 'averageCost',
                xDrag: dragParam,
                label: {
                    text: label
                },
                droplines: {
                    horizontal: 'AC(q'+ labelSubscript +')'
                }
            })
        }



    }

}