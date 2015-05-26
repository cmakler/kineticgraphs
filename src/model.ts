module KineticGraphs
{
    export interface ModelDefinition
    {

    }

    export interface IModel
    {
        update: (scope:IScope, callback?: (any)=>any) => void;
    }

    export class Model
    {

        constructor(public definition:ModelDefinition) {

            var model = this;

            for (var key in definition) {
                if(definition.hasOwnProperty(key) && definition[key] != undefined) {
                    var value = definition[key];
                    if(value.hasOwnProperty('type') && value.hasOwnProperty('definition')) {
                        model[key] = createInstance(value)
                    }
                }
            }
        }

        // Update the model
        update(scope, callback) {

            var model = this;

            // Iterates over an object's definition, getting the current value of each property
            function parseObject(def, obj?) {
                obj = obj || {};
                for(var key in def) {
                    if(def.hasOwnProperty(key)) {
                        if(obj[key] instanceof KineticGraphs.Model) {
                            // if the property is itself a model, update the model
                            obj[key].update(scope);
                        } else {
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
                } else {
                    var e = scope.$eval(value.toString());
                    return (e == undefined) ? value : e;
                }
            }

            // Parse the model object
            model = parseObject(model.definition, model);

            if(callback){
                callback();
            }

            return model;



        }
    }
}