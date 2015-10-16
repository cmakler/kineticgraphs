/// <reference path="../kg.ts"/>

'use strict';

module KG
{

    export function getDefinitionProperty(def) {
        if(typeof def == 'string') {
            if(def.match(/[\*/+-]/)) {
                return '(' + def + ')'
            } else {
                return def;
            }
        } else {
            return def;
        }
    }

    export function getPropertyAsString(def) {
        var d = def;
        if(typeof d == 'number') {
            return d.toString()
        } else {
            return "(" + d.toString() + ")"
        }
    }

    export function binaryFunction(def1,def2,fn) {
        if(typeof def1 == 'number' && typeof def2 == 'number') {
            switch(fn) {
                case "+":
                    return def1 + def2;
                    break;
                case "-":
                    return def1 - def2;
                    break;
                case "/":
                    return def1 / def2;
                    break;
                case "*":
                    return def1 * def2;
                case "^":
                    return Math.pow(def1,def2);
            }

        } else if(fn === '^') {
            return "Math.pow("+def1+","+def2+")"
        } else {
            return "(" + getDefinitionProperty(def1) + fn + getDefinitionProperty(def2) + ")"
        }
    }

    export function addDefs(def1,def2) {
        return binaryFunction(def1,def2,'+');
    }

    export function subtractDefs(def1,def2) {
        return binaryFunction(def1,def2,'-');
    }

    export function divideDefs(def1,def2) {
        return binaryFunction(def1,def2,'/');
    }

    export function multiplyDefs(def1,def2) {
        return binaryFunction(def1,def2,'*');
    }

    export function squareDef(def) {
        return binaryFunction(def,def,'*');
    }

    export function raiseDefToDef(def1, def2) {
        return binaryFunction(def1,def2,'^');
    }

    export function createInstance(definition,modelPath?) {

        // from http://stackoverflow.com/questions/1366127/
        function typeSpecificConstructor(typeName) {
            var arr = typeName.split(".");

            var fn = (window || this);
            for (var i = 0, len = arr.length; i < len; i++) {
                fn = fn[arr[i]];
            }

            if (typeof fn !== "function") {
                throw new Error("object type " + typeName + " not found");
            }

            return fn;
        }

        // each object is a new instance of the class named in the 'type' parameter
        var newObjectConstructor = typeSpecificConstructor(definition.type);
        return new newObjectConstructor(definition.definition, modelPath);

    }

}