/// <reference path="../kg.ts"/>
var KineticGraphs;
(function (KineticGraphs) {
    var Primitives = (function () {
        function Primitives() {
            this.PRIMITIVE_TYPES = ['area', 'rect', 'curve', 'line', 'circle'];
        }
        return Primitives;
    })();
    KineticGraphs.Primitives = Primitives;
    var Primitive = (function () {
        function Primitive() {
        }
        Primitive.prototype.render = function (vis) {
            return vis;
        };
        return Primitive;
    })();
    KineticGraphs.Primitive = Primitive;
})(KineticGraphs || (KineticGraphs = {}));
//# sourceMappingURL=primitive.js.map