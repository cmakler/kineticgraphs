'use strict';

module KG
{
    export interface ModelDefinition
    {

    }

    export interface IPropertySetter
    {
        name: string;
        value: any;
        defaultValue: any;
    }

    export interface IModel
    {
        modelPath: string;
        modelProperty: (name:string) => string;
        setNumericProperty: (propertySetter:IPropertySetter) => Model;
        setArrayProperty: (propertySetter:IPropertySetter) => Model;
        update: (scope:IScope, callback?: (any)=>any) => void;
        _update: (scope:IScope) => Model;
        _calculateValues: () => Model;
    }



    export class Model
    {

        constructor(public definition:ModelDefinition, public modelPath?: string) {

            var model = this;

            model.modelPath = modelPath || 'model';

            for (var key in definition) {
                if(definition.hasOwnProperty(key) && definition[key] != undefined) {
                    var value = definition[key];
                    if(value.hasOwnProperty('type') && value.hasOwnProperty('definition')) {
                        model[key] = createInstance(value)
                    } else {
                        model[key] = value;
                    }
                }
            }

        }

        modelProperty(name) {
            return this.modelPath + '.' + name;
        }

        setNumericProperty(propertySetter) {
            var model = this;
            if(!isNaN(propertySetter.value)) {
                model[propertySetter.name] = propertySetter.value;
            } else if(!model.hasOwnProperty(propertySetter.name)) {
                model[propertySetter.name] = propertySetter.defaultValue || 0;
            }
            return model;
        }

        setArrayProperty(propertySetter) {
            var model = this;
            if(propertySetter.value instanceof Array) {
                model[propertySetter.name] = propertySetter.value;
            } else if(propertySetter.value) {
                model[propertySetter.name] = [propertySetter.value];
            } else if(!model.hasOwnProperty(propertySetter.name)) {
                model[propertySetter.name] = propertySetter.defaultValue;
            }
            return model;
        }

        // Update the model
        update(scope, callback?) {

            var model = this;

            // Iterates over an object's definition, getting the current value of each property
            function parseObject(def, obj?) {
                obj = obj || {};
                for(var key in def) {
                    if(def.hasOwnProperty(key)) {
                        if(obj[key] instanceof KG.Model) {
                            // if the property is itself a model, update the model
                            obj[key].update(scope);
                        } else if(def[key] !== undefined) {
                            // otherwise parse the current value of the property
                            obj[key] = deepParse(def[key]);
                        }
                    }
                }
                return obj;
            }

            // Returns the value of an object's property, evaluated against the current scope.
            function deepParse(value) {
                if(Object.prototype.toString.call(value) == '[object Array]') {
                    // If the object's property is an array, return the array mapped to its parsed values
                    // see http://stackoverflow.com/questions/4775722/check-if-object-is-array
                    return value.map(deepParse)
                } else if(typeof value == 'object') {
                    // If the object's property is an object, parses the object.
                    return parseObject(value)
                } else if(scope && value.toString() !== undefined) {
                    try{
                        var e = scope.$eval(value.toString());
                        return (e == undefined) ? value : e;
                    }
                    catch(error) {
                        return value;
                    }
                } else {
                    return value;
                }
            }

            // Parse the model object
            model = parseObject(model.definition, model);

            // Do any model-specific updating
            model = model._update(scope)._calculateValues();


            if(callback){
                callback();
            }

            return model;

        }

        _update(scope) {
            return this; // overridden by child classes
        }

        _calculateValues() {
            return this; // overridden by child classes
        }
    }
}