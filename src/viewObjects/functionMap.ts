/// <reference path="../kg.ts"/>

'use strict';

module KG {

    export interface FunctionMapDefinition extends PathFamilyDefinition {
        fn: any;
        levels: any[];
        numSamplePoints?: number;
    }

    export interface IFunctionMap extends IPathFamily {
        fn: KGMath.Functions.Base;
        levels: number[];
        numSamplePoints: number;
    }

    export class FunctionMap extends PathFamily implements IFunctionMap {

        public fn;
        public levels;
        public numSamplePoints;

        constructor(definition:FunctionPlotDefinition, modelPath?: string) {
            definition = _.defaults(definition, {interpolation: 'basis', numSamplePoints: 51});
            super(definition, modelPath);
        }

        _update(scope) {
            var p = this;
            p.fn.update(scope);
            return p;
        }

        updateDataForView(view) {
            var p = this;
            p.data = p.levels.map(function(level) { return p.fn.setLevel(level).points(view) });
            return p;
        }

    }

}