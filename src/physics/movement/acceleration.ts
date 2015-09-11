/**
 * Created by cmakler on 9/10/15.
 */

module PhysicsGraphs {

    export interface AccelerationDefintion extends KG.ModelDefinition {
        acceleration: any;
        initialPosition: any;
        initialVelocity: any;
        positionVertex: KG.ICoordinates;
    }

    export interface IAcceleration extends KG.IModel {
        acceleration: number;
        initialPosition: number;
        initialVelocity: number;
        positionVertex: KG.ICoordinates;

        accelerationFunction: KGMath.Functions.HorizontalLine;
        velocityFunction: KGMath.Functions.Linear;
        positionFunction: KGMath.Functions.Quadratic;

        accelerationView: KG.HorizontalLine;
        velocityView: KG.Line;
        positionView: KG.Curve;

    }

    export class Acceleration extends KG.Model implements IAcceleration {

        public acceleration;
        public initialPosition;
        public initialVelocity;
        public positionVertex;

        public accelerationFunction;
        public velocityFunction;
        public positionFunction;

        public accelerationView;
        public velocityView;
        public positionView;

        public initialPositionPoint;
        public initialVelocityPoint;
        public positionVertexPoint;
        public zeroVelocityLine;

        constructor(definition:AccelerationDefintion, modelPath?: string) {
            super(definition, modelPath);

            var model = this;

            /*
            model.accelerationFunction = new KGMath.Functions.HorizontalLine({y: definition.acceleration});
            model.velocityFunction = model.accelerationFunction.integral(0,definition.initialVelocity);
            model.positionFunction = model.velocityFunction.integral(0,definition.initialPosition,'positionFunction');
            */

            model.positionFunction = new KGMath.Functions.Quadratic({
                coefficients: {
                    a: definition.acceleration,
                    b: definition.initialVelocity,
                    c: definition.initialPosition
                },
            },model.modelProperty('positionFunction'));
            model.velocityFunction = model.positionFunction.derivative();
            model.accelerationFunction = model.velocityFunction.derivative();

            model.accelerationView = new KG.HorizontalLine({
                name: 'accelerationView',
                className: 'growth',
                y: definition.acceleration
            });

            model.velocityView = new KG.Line({
                name: 'velocityView',
                className: 'totalCost',
                lineDef: model.velocityFunction.definition
            });

            model.positionView = new KG.FunctionPlot({
                name: 'positionView',
                className: 'growth',
                fn: model.modelProperty('positionFunction')
            });

            model.initialPositionPoint = new KG.Point({
                name: 'initialPositionPoint',
                className: 'growth',
                coordinates: {
                    x: 0,
                    y: definition.initialPosition
                },
                yDrag: definition.initialPosition,
                label: {
                    text: 'x_0'
                }
            });

            model.initialVelocityPoint = new KG.Point({
                name: 'initialVelocityPoint',
                className: 'totalCost',
                coordinates: {
                    x: 0,
                    y: definition.initialVelocity
                },
                yDrag: definition.initialVelocity,
                label: {
                    text: 'v_0'
                }
            });

            model.positionVertexPoint = new KG.Point({
                name: 'positionVertexPoint',
                className: 'growth',
                coordinates: {
                    x: model.positionFunction.definition.vertex.x,
                    y: model.positionFunction.definition.vertex.y
                },
                droplines: {
                    vertical: "x"
                }
            });


            model.zeroVelocityLine = new KG.HorizontalLine({y: 0, name: 'zeroVelocity', className:'dotted totalCost'})


        }

    }

}