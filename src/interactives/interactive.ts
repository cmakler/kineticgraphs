
/* interactives/interactive.ts */

/// <reference path="../kg.ts"/>
/// <reference path="../model/parameterizable.ts"/>

module KineticGraphs
{
    export interface IInteractiveDefinition extends IParameterizableDefinition
    {
        element_id: string;
        dimensions?: IDimensions;
        margins?: IMargins;
    }

    export interface IInteractive extends IParameterizable
    {
        vis: D3.Selection;
        scope: IModelScope;

        redraw: () => IInteractive;
        drawObjects: () => Interactive;
        updateDimensions: (clientWidth: number, dimensions?: IDimensions) => IDimensions;

    }

    export class Interactive extends Parameterizable implements IInteractive
    {
        public element_id;
        public vis;

        constructor(definitionString:string) {
            super(definitionString);
        }

        redraw() {
            return this; // overridden by child classes
        }

        drawObjects() {
            return this;
        }

        // Rules for updating the dimensions fo the graph object, based on current graph element clientWidth
        updateDimensions(clientWidth, dimensions?) {

            // Set default to the width of the enclosing element, with a height of 500
            var newDimensions: IDimensions = {width: clientWidth, height: 500};

            // If the author has specified a height, override
            if (dimensions && dimensions.hasOwnProperty('height')) {
                newDimensions.height = dimensions.height;
            }

            // If the author has specified a width less than the graph element clientWidth, override
            if(dimensions && dimensions.hasOwnProperty('width') && dimensions.width < clientWidth) {
                newDimensions.width = dimensions.width;
            }

            return newDimensions;
        }
    }
}