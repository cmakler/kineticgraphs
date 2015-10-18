/// <reference path="../kg.ts"/>

'use strict';

module KG
{

    export interface DomainDef {
        min: any;
        max: any;
    }

    export interface IDomain {
        min: number;
        max: number;
        samplePoints: (numSamples:number) => number[];
        toArray: () => number[];
        contains: (x:number, strict?:boolean) => boolean;
        closestValueTo: (x:number) => number;
        intersection: (otherDomain:Domain) => Domain;
    }

    export class Domain extends Model implements IDomain {

        public min;
        public max;

        constructor(min: number, max: number) {
            super({
                min: min || 0,
                max: max || 10
            });
        }

        toArray() {
            return [this.min, this.max]
        }

        contains(x, strict?) {
            strict = strict || false;
            if(x == undefined || x == null || isNaN(x)) { return false }
            var lowEnough:boolean = strict ? (this.max > x) : (this.max - x >= -0.0001);
            var highEnough:boolean = strict ? (this.min < x) : (this.min - x <= 0.0001);
            return lowEnough && highEnough;
        }

        closestValueTo(x) {
            if (x < this.min) {
                return this.min
            } else if (x > this.max) {
                return this.max
            } else {
                return x
            }

        }

        samplePoints(numSamples) {
            var min = this.min, max = this.max, sp = [];
            for(var i=0;i<numSamples;i++) {
                sp.push(min + (i/(numSamples-1))*(max - min));
            }
            return sp;
        }

        intersection(otherDomain:Domain) {
            var thisDomain = this;
            if(!otherDomain || otherDomain == undefined) {
                return thisDomain;
            }
            var min = Math.max(thisDomain.min, otherDomain.min),
                max = Math.min(thisDomain.max, otherDomain.max);
            if(max < min) {
                return null;
            } else {
                return new Domain(min,max);
            }
        }

    }

    export interface DomainSamplePointsDef {
        min: number;
        max: number;
        numSamplePoints: number;
    }

    export function samplePointsForDomain(def: DomainSamplePointsDef) {

        var domain = new Domain(def.min,def.max),
            sampleAdjustment = isNaN(def.min) ? 0 : def.min % 10, // roughly adjusts to choose integer sample points
            numSamplePoints = def.numSamplePoints || 101 - sampleAdjustment;

        return domain.samplePoints(numSamplePoints);
    }

}