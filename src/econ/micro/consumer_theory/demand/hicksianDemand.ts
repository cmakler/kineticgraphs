/// <reference path="../../../eg.ts"/>

module EconGraphs {

    export interface HicksianDemandDefinition extends UtilityDemandDefinition{
        utilityConstraintDef: UtilityConstraintDefinition;
    }

    export interface IHicksianDemand extends IUtilityDemand {

    }

    export class HicksianDemand extends UtilityDemand implements IHicksianDemand {

        public u;
        public px;
        public py;

        constructor(definition:HicksianDemandDefinition, modelPath?:string) {
            super(definition, modelPath);
        }

        quantityAtPrice(price,good) {
            var d = this;
            good = good || 'x';

            // store original price in budget constraint
            var originalPrice = d['p' + good];

            // evaluate quantity demanded of this good at the given price
            d['p' + good] = price;
            var quantity = d.utility.lowestCostBundle(d.u, d.px, d.py)[good];

            // reset budget constraint to original price
            d['p' + good] = originalPrice;

            return quantity;

        }


    }
}