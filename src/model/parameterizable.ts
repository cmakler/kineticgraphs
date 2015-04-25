/**
 * Created by cmakler on 4/24/15.
 */

module KineticGraphs
{
    export interface IParameterizableDefinition
    {

    }

    export interface IParameterizable
    {
        definitionString: string;
        definition: IParameterizableDefinition;
        scope: IModelScope;
        update: (scope:IModelScope) => IParameterizable;
        _update: () => void;
    }

    export class Parameterizable
    {

        public definition;
        public scope;

        // Define using a string
        constructor(public definitionString:string) {}

        // Establish the scope, and evaluate the definition under this new scope
        update(scope) {
            this.scope = scope;
            this.definition = scope.$eval(this.definitionString);
            this._update();
            return this;
        }

        _update() {} //overridden by child class

    }
}