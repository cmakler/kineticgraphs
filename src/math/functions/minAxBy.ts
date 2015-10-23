module KGMath.Functions {

    export interface MinAxByDefinition extends BaseDefinition {
        xCoefficient: any;
        yCoefficient: any;
    }

    export interface IMinAxBy extends IBase {
        xCoefficient: number;
        yCoefficient: number;
    }

    export class MinAxBy extends Base implements IMinAxBy {

        public xCoefficient;
        public yCoefficient;

        constructor(definition:MinAxByDefinition, modelPath?: string) {
            super(definition, modelPath);
        }

        value(bases?) {

            var m = this;

            if(bases) {
                m.setBases(bases);
            }

            var xMinimand = m.xCoefficient*m.bases[0],
                yMinimand = m.yCoefficient*m.bases[1];

            if(isNaN(xMinimand)) {
                return yMinimand;
            } else if(isNaN(yMinimand)) {
                return xMinimand;
            } else {
                return Math.min(xMinimand, yMinimand);
            }

        }

        points(view) {

            var m = this;

            var criticalX = m.level/m.xCoefficient,
                criticalY = m.level/m.yCoefficient;

            return [
                {
                    x: criticalX,
                    y: view.yAxis.max
                },
                {
                    x: criticalX,
                    y: criticalY
                },
                {
                    x: view.xAxis.max,
                    y: criticalY
                }
            ]

        }
    }

}