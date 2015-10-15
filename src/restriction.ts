'use strict';

module KG
{
    export interface RestrictionDefinition extends ModelDefinition
    {
        expression: string;
        restrictionType: string;
        min?: number;
        max?: number;
        precision?: number;
        set?: any[];
        error?: string;
    }

    export interface IRestriction extends IModel
    {
        validate: (params:{}) => any;
        error: string;
    }

    export class Restriction extends Model
    {

        private expression;
        private restrictionType;
        private min;
        private max;
        private set;
        private precision;
        public error;

        static RANGE_TYPE = "range";
        static SET_TYPE = "set";
        static BOOLEAN_TYPE = "boolean";

        constructor(definition:RestrictionDefinition) {
            super(definition);
        }

        validate(params) {

            var r = this;

            function isSimpleParam(name) {
                var match = name.match(/params\.[a-zA-Z0-9]+/);
                if(match) {
                    return (name === match[0]);
                } else {
                    return false;
                }

            }

            function paramName(name) {
                return name.split('params.')[1];
            }

            if(r.restrictionType === Restriction.RANGE_TYPE){
                if(r.min > r.max){
                    var maxName = r.definition['max'];
                    if(isSimpleParam(maxName)){
                        params[paramName(maxName)] = r.min;
                        return params;
                    }
                    var minName = r.definition['min'];
                    if(isSimpleParam(minName)){
                        params[paramName(minName)] = r.max;
                        return params;
                    }
                    return false;
                }
                var e = r.definition['expression'];
                if(isSimpleParam(e)) {
                    var param = paramName(e);
                    var value = this.round();
                    if(value < r.min) {
                        params[param] = r.min;
                    } else if(value > r.max) {
                        params[param] = r.max;
                    } else {
                        params[param] = value;
                    }
                    return params;
                } else if(r.min <= r.expression && r.expression <= r.max){
                    return params;
                } else {
                    return false;
                }
            }

            if(r.restrictionType === Restriction.SET_TYPE){
                if(r.set.indexOf(r.expression) > -1) {
                    return params;
                } else {
                    return false;
                }
            }

            if(r.restrictionType === Restriction.BOOLEAN_TYPE){
                if(r.expression){
                    return params;
                } else {
                    return false;
                }
            }

        }

        round() {
            var r = this;
            if(r.precision > 0) {
                var delta = r.expression - r.min;
                var steps = Math.round(delta/r.precision);
                return r.min + (steps * r.precision);
            } else {
                return r.expression;
            }
        }
    }
}