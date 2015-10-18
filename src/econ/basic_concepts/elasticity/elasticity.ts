/// <reference path="../../eg.ts"/>

module EconGraphs {

    export interface ElasticityDefinition extends KG.ModelDefinition
    {
        inverse? : boolean;
        terms?: {};
        fn? : KGMath.Functions.Base;
    }

    export interface IElasticity extends KG.IModel
    {
        calculateElasticity: (inputs? : any) => Elasticity;
        _calculateElasticity: (inputs : any) => Elasticity;
        elasticity: number;
        absoluteElasticity: number;
        elasticityWord: string;
        elasticityNumber: (absoluteValue:boolean) => string
        elasticityComparator: string;
    }

    export class Elasticity extends KG.Model
    {
        private terms;
        public inverse;
        public elasticity;
        public absoluteElasticity;
        public elasticityWord;
        public elasticityComparator;

        constructor(definition:ElasticityDefinition, modelPath?:string) {
            definition.inverse = _.defaults(false, definition.inverse);
            definition.terms = _.defaults({
                perfectlyElastic: "perfectly elastic",
                perfectlyInelastic: "perfectly inelastic",
                elastic: "elastic",
                inelastic: "inelastic",
                unitElastic: "unit elastic"
            },definition.terms);
            super(definition, modelPath);
        }

        calculateElasticity(inputs? : any) {

            var e = this;

            e = e._calculateElasticity(inputs);

            e.absoluteElasticity = Math.abs(e.elasticity);
            if(isNaN(e.absoluteElasticity)) {
                e.absoluteElasticity == '\\emptyset';
            }
            e.elasticityComparator = e.elasticityNumber(true);

            if(e.absoluteElasticity == 0) {
                e.elasticityWord = e.terms.perfectlyInelastic;
            } else if(e.absoluteElasticity < 1) {
                e.elasticityWord =  e.terms.inelastic;
                e.elasticityComparator += "< 1";
            } else if(e.absoluteElasticity == 1) {
                e.elasticityWord =  e.terms.unitElastic;
            } else if(e.absoluteElasticity == Infinity) {
                e.elasticityWord =  e.terms.perfectlyElastic;
            } else if(e.absoluteElasticity > 1) {
                e.elasticityWord = e.terms.elastic;
                e.elasticityComparator += "> 1";
            } else {
                e.elasticityWord = 'undefined';
            }

            return e;
        }

        _calculateElasticity(inputs) {
            return this; // overridden by subclass
        }

        elasticityNumber(absoluteValue:boolean) {
            var e = this;
            absoluteValue = absoluteValue || false;

            if(isNaN(e.absoluteElasticity)) {
                return "\\emptyset";
            }

            var returnString = (!absoluteValue && e.elasticity < 0) ? '-' : '';

            returnString += (e.absoluteElasticity == Infinity) ? "\\infty" : (e.absoluteElasticity == 0) ? "0" : (e.absoluteElasticity == 1) ? "1" : e.absoluteElasticity.toFixed(2);

            return returnString;
        }

        _update(scope) {
            return this.calculateElasticity();
        }

    }

}