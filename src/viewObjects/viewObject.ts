/// <reference path="../kg.ts"/>


module KineticGraphs
{

    export interface ViewObjectDefinition extends ModelDefinition
    {
        name: string;
        show?: boolean;
        className?: string;
    }

    export interface IViewObject extends IModel
    {
        show: boolean;
        className?: string;
        name: string;
        render: (view: View) => View;
        classAndVisibility: () => string;
    }

    export class ViewObject extends Model implements IViewObject
    {

        public show;
        public className;
        public name;

        constructor(definition:ViewObjectDefinition) {
            definition = _.defaults(definition, {className: '', show: true});
            super(definition);
        }

        classAndVisibility() {
            var VISIBLE_CLASS = this.className + ' visible',
                INVISIBLE_CLASS = this.className + ' invisible';

            return this.show ? VISIBLE_CLASS : INVISIBLE_CLASS;
        }

        render(graph) {
            return graph; // overridden by child class
        }

    }



}