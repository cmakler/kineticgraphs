/// <reference path="../../../eg.ts"/>

module EconGraphs {

    export interface BudgetSegmentDefinition extends KG.ModelDefinition {
        income?: any;
        endowment?: KG.ICoordinates;
        px: any;
        py: any;
        xMin?: any;
        xMax?: any;
        yMin?: any;
        yMax?: any;
        priceRatio?: any;
    }

    export interface IBudgetSegment extends KG.IModel {
        income: number;
        px: number;
        py: number;
        priceRatio: number;
        isAffordable: (bundle:KG.ICoordinates) => boolean;
        linear: KGMath.Functions.Linear;
        setPrice: (price:number, good?: string) => BudgetSegment;
        setIncome: (income:number) => BudgetSegment;
    }

    export class BudgetSegment extends KG.Model implements IBudgetSegment {

        public income;
        public px;
        public py;
        public priceRatio;
        public xDomain;
        public yDomain;
        public linear;

        constructor(definition:BudgetSegmentDefinition, modelPath?: string) {

            if(definition.hasOwnProperty('endowment')) {
                if(definition.endowment.hasOwnProperty('x') && definition.endowment.hasOwnProperty('y')) {
                    var endowmentValueX = KG.multiplyDefs(definition.endowment.x,definition.px),
                        endowmentValueY = KG.multiplyDefs(definition.endowment.y,definition.py);
                    definition.income = KG.addDefs(endowmentValueX,endowmentValueY);
                } else {
                    console.log('Endowment must have x and y properties:');
                    console.log(definition.endowment);
                }
            }

            definition.priceRatio = KG.divideDefs(definition.px, definition.py);

            super(definition,modelPath);

            var b = this;

            var xMin = definition.xMin || 0,
                xMax = definition.xMax || KG.divideDefs(definition.income,definition.px),
                yMin = definition.yMin || 0,
                yMax = definition.yMax || KG.divideDefs(definition.income,definition.py);

            b.xDomain = new KG.Domain(xMin,xMax);
            b.yDomain = new KG.Domain(yMin,yMax);

            if(definition.hasOwnProperty('endowment')) {
                b.linear = new KGMath.Functions.Linear({
                    point: definition.endowment,
                    slope: KG.multiplyDefs(-1,definition.priceRatio),
                    xDomain: b.xDomain,
                    yDomain: b.yDomain
                })
            } else {
                b.linear = new KGMath.Functions.Linear({
                    coefficients: {
                        a: definition.px,
                        b: definition.py,
                        c: KG.multiplyDefs(-1,definition.income)
                    },
                    xDomain: b.xDomain,
                    yDomain: b.yDomain
                })
            }

        }

        _update(scope) {
            var b = this;
            b.linear.update(scope);
            return b;
        }

        isAffordable(bundle:KG.ICoordinates) {
            var b = this;

            // return false if not in the domain for which this budget segment is relevant
            if(!b.xDomain.contains(bundle.x) || !b.xDomain.contains(bundle.y)) {
                return false;
            }

            // the bundle's cost is the quantities of x and y times their prices
            var bundleCost = b.px*bundle.x + b.py*bundle.y;

            // return true if the bundle's cost is less than or equal to constraint's income
            return (bundleCost <= b.income);
        }

        setPrice(price,good,max?) {
            var b = this;
            max = max || b.income / price;
            b['p'+good] = price;
            b.linear[good + 'Domain'].max = max;
            if(b.linear.definition.hasOwnProperty('endowment')) {
                b.linear.slope = -b.px/b.py;
            } else if(good=='y') {
                b.linear.coefficients.b = price;
            } else {
                b.linear.coefficients.a = price;
            }
            return b;
            //console.log('set price of ',good,' to ', price)
        }

        setIncome(income) {
            var b = this;
            b.income = income;
            b.linear.xDomain.max = b.income / b.px;
            b.linear.yDomain.max = b.income / b.py;
            b.linear.coefficients.c = -income;
            return b;
            //console.log('set income to ',income);
        }

    }


}