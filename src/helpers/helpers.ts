/// <reference path="../kg.ts"/>

'use strict';

module KG
{

    export function colorForClassName(className:string, shade?:string) {
        if(className) {
            className = className.split(' ')[0];
        }
        shade = shade || 'dark';
        var classColor = KG.CLASS_COLORS[className] || 'gray';
        return KG.COLORS[classColor][shade];
    }

    export function allColors() {
        var colorArray = [];
        for(var color in KG.COLORS) {
            for(var shade in KG.COLORS[color]) {
                colorArray.push(KG.COLORS[color][shade])
            }
        }
        return colorArray;
    }

    export interface DomainDef {
        min: any;
        max: any;
    }

    export interface IDomain
    {
        min: number;
        max: number;
        samplePoints: (numSamples:number) => number[];
        toArray: () => number[];
        contains: (x:number, strict?:boolean) => boolean;
        closestValueTo: (x:number) => number;
        intersection: (otherDomain:Domain) => Domain;
    }

    export class Domain implements IDomain
    {

        constructor(public min: number, public max: number) {
            this.min = this.min || 0;
            this.max = this.max || 10;
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

    export interface IDimensions
    {
        height: number;
        width: number;
    }

    export interface IMargins
    {
        left: number;
        top: number;
        right: number;
        bottom: number;
    }

    export interface ICoordinates
    {
        x: any;
        y: any;
    }

    export function isAlmostTo(a:number,b:number,t?:number,basis?:number) {
        t = t || 0.01;
        var diff = Math.abs(a - b),
            avg = basis || 0.5*(a + b);
        if(avg > t*10) {
            return (diff/avg < t);
        } else {
            return diff < t;
        }

    }

    export function areTheSamePoint(a:ICoordinates, b:ICoordinates) {
        return isAlmostTo(a.x, b.x) && isAlmostTo(a.y,b.y);
    }

    export function areNotTheSamePoint(a:ICoordinates, b:ICoordinates) {
        return !areTheSamePoint(a,b);
    }

    export function arrayDoesNotHavePoint(a:ICoordinates[], b:ICoordinates){
        var foundIt = true;
        a.forEach(function(p){
            if(areTheSamePoint(b,p)) {
                foundIt = false;
            }
        });
        return foundIt;
    }

    export function arrayAverage(o: any[]) {

        var allNumbers = true;
        o.forEach(function(obj) { if(typeof obj !== 'number') { allNumbers = false}});

        if(allNumbers) {
            var sum = 0;
            for(var i=0; i<o.length; i++) {
                sum += o[i];
            }
            return sum/o.length;
        } else {
            var avgObj = {}
            for(var key in o[0]) {
                var allObjectsHaveKey = true;
                o.forEach(function(obj) { if(!obj.hasOwnProperty(key)) { allObjectsHaveKey = false}});
                if(allObjectsHaveKey) {
                    avgObj[key] = arrayAverage(o.map(function(obj) { return obj[key]}));
                }
            }
            return avgObj;
        }

    }

    export function averageTwoObjects(o1: any, o2: any) {

        if(typeof o1 == 'number' && typeof o2 == 'number') {
            return 0.5*(o1 + o2);
        } else if(typeof o1 == 'object' && typeof o2 == 'object') {
            var avgObj = {}
            for(var key in o1) {
                if(o1.hasOwnProperty(key) && o2.hasOwnProperty(key)) {
                    avgObj[key] = averageTwoObjects(o1[key],o2[key]);
                }
            }
            return avgObj;
        }

    }

    export function medianDataPoint(data:any[]) {

        var l = data.length;
        if(l % 2) {
            return data[(l-1)/2]
        } else {
            return averageTwoObjects(data[l/2],data[l/2 - 1]);
        }
    }

    export function translateByPixelCoordinates(coordinates:ICoordinates) {
        return 'translate(' + coordinates.x + ',' + coordinates.y + ')'
    }

    export function positionByPixelCoordinates(coordinates:ICoordinates, dimension?:IDimensions) {
        var style = 'position:relative; left: ' + coordinates.x + 'px; top: ' + coordinates.y + 'px;';
        if(dimension) {
            if(dimension.hasOwnProperty('width')) {
                style += ' width: ' + dimension.width + 'px;'
            }
        }
        return style;
    }

    export function distanceBetweenCoordinates(a:ICoordinates, b:ICoordinates){
        return Math.sqrt(Math.pow(a.x - b.x,2) + Math.pow(a.y - b.y,2))
    }

    // Takes a variety of ways of defining x-y coordinates and returns an object with x and y properties
    export function getCoordinates(def) {
        var defaultCoordinates:{} = {x: 0, y: 0};
        if(!def || def == undefined) {
            return defaultCoordinates;
        }
        if(def.hasOwnProperty('coordinates')){
            return def.coordinates;
        } else if(def.hasOwnProperty('x') && def.hasOwnProperty('y')){
            return def;
        } else if(def.hasOwnProperty('definition')) {
            return getCoordinates(def.definition)
        } else {
            return defaultCoordinates;
        }
    }

    // Takes a variety of ways of defining x-y coordinates and returns an array [x,y]
    export function getBases(def) {
        var coordinates = getCoordinates(def);
        return [coordinates.x, coordinates.y];
    }

    export function sortObjects(key, descending?) {
        return function (a, b) {
            var lower = descending ? a[key] : b[key],
                higher = descending ? b[key] : a[key];
            return lower > higher ? -1 : lower < higher ? 1 : lower <= higher ? 0 : NaN;
        }
    }

}