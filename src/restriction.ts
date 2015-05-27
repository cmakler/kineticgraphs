'use strict';

module KG
{
    export interface RestrictionDefinition extends ModelDefinition
    {
        expression: string;
        restrictionType: string;
        min?: number;
        max?: number;
        precision: number;
        set: any[];
    }

    export interface IRestriction extends IModel
    {
        validate: (params:{}) => any;
    }

    export class Restriction extends Model
    {

        private expression;
        private restrictionType;
        private min;
        private max;
        private set;
        private precision;

        constructor(definition:RestrictionDefinition) {
            super(definition);
        }

        validate(params) {

            var RANGE_TYPE = "range";
            var SET_TYPE = "set";

            var r = this;

            function isSimpleParam(name) {
                return name === name.match(/params\.[a-zA-Z0-9]+/)[0]
            }

            function paramName(name) {
                return name.split('params.')[1];
            }

            if(r.restrictionType === RANGE_TYPE){
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

            if(r.restrictionType === SET_TYPE){
                if(r.set.indexOf(r.expression) > -1) {
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