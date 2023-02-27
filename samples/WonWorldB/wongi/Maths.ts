import Vec3 from "./maths/Vec3";
import Mat4 from "./maths/Mat4";
import Quat from "./maths/Quat";

const Maths = {
  PI_H: 1.5707963267948966,
  PI_2: 6.283185307179586,
  PI_Q: 0.7853981633974483,

  DEG2RAD: 0.01745329251, // PI / 180
  RAD2DEG: 57.2957795131, // 180 / PI

  EPSILON: 1e-6,

  toRad: function (v: number) {
    return v * Maths.DEG2RAD;
  },
  toDeg: function (v: number) {
    return v * Maths.RAD2DEG;
  },

  map: function (
    x: number,
    xMin: number,
    xMax: number,
    zMin: number,
    zMax: number
  ) {
    return ((x - xMin) / (xMax - xMin)) * (zMax - zMin) + zMin;
  },
  clamp: function (v: number, min: number, max: number) {
    return Math.max(min, Math.min(max, v));
  },

  lerp: function (a: number, b: number, t: number) {
    return (1 - t) * a + t * b;
  },

  smoothStep: function (edge1: number, edge2: number, val: number) {
    const x = Math.max(0, Math.min(1, (val - edge1) / (edge2 - edge1)));
    return x * x * (3 - 2 * x);
  }
};

export default Maths;
export { Vec3, Mat4, Quat };
