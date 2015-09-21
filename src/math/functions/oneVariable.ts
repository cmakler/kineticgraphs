module KGMath.Functions {

    export interface OneVariableDefinition extends BaseDefinition {
        fn: any;
    }

    export interface IOneVariable extends IBase {
        fn: (x:number) => number;
    }

    export class OneVariable extends Base implements IOneVariable {

        public fn;

        constructor(definition:OneVariableDefinition, modelPath?: string) {
            super(definition, modelPath);
        }

        yValue(x) {
            return this.fn(x);
        }

    }

}