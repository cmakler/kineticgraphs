/// <reference path="../eg.ts"/>

'use strict';

module EconGraphs {

    export interface LinearMarginalCostDefinition extends ProductionCostDefinition
    {
        fixedCost: any;
        marginalCostLineType: any;
        marginalCostLineDef: any;
    }

    export interface ILinearMarginalCost extends IProductionCost
    {
        marginalCostLine: KGMath.Functions.Linear;
        marginalCostLineView: KG.Line;
    }

    export class LinearMarginalCost extends ProductionCost implements ILinearMarginalCost
    {
        public marginalCostLine;
        public marginalCostLineView;

        constructor(definition:LinearMarginalCostDefinition) {

            this.marginalCostLine = new KGMath.Functions[definition.marginalCostLineType](definition.marginalCostLineDef);

            definition.costFunctionType = 'Polynomial';
            definition.costFunctionDef = {termDefs:[
                {
                    coefficient: '0.5*(' + definition.marginalCostSlope + ')',
                    powers: [2]
                },
                {
                    coefficient: definition.marginalCostIntercept,
                    powers: [1]
                },
                {
                    coefficient: definition.fixedCost,
                    powers: [0]
                }
            ]};
            definition.fixedCostDragParam = definition.fixedCost;

            super(definition);

            var productionCost = this;

            // If MC(q) = a + bq, then TC(q) = FC + aq + 0.5bq^2.

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