
/* interactives/interactive.ts */

/// <reference path="../kg.ts"/>

module KineticGraphs
{
    export interface IInteractiveDefinition
    {
        element_id: string;
        dimensions?: IDimensions;
        margins?: IMargins;
    }

    export interface IInteractive
    {
        definitionString: string;
        definition: IInteractiveDefinition;
        vis: D3.Selection;
        scope: IModelScope;

        update: (scope:IModelScope, redraw?: boolean) => IInteractive;
        redraw: () => IInteractive;
        drawObjects: () => Interactive;
        updateDimensions: (clientWidth: number, dimensions?: IDimensions) => IDimensions;

    }

    export class Interactive implements IInteractive
    {
        public definition;
        public element_id;
        public scope;
        public vis;

        constructor(public definitionString:string) {}

        update(scope, redraw?) {

            var interactive = this;

            // Set redraw to true by default
            if(redraw == undefined) { redraw = true }

            // Establish the scope, and evaluate the definition under this new scope
            interactive.scope = scope;
            interactive.definition = scope.$eval(interactive.definitionString);

            // Redraw if necessary
            if(redraw) {
                interactive = interactive.redraw();
            }

            // Draw graph objects and return
            return interactive.drawObjects();

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