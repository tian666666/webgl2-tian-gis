/*
 * @Description:
 * @Author: tianyw
 * @Date: 2023-02-15 22:34:37
 * @LastEditTime: 2023-02-15 23:30:43
 * @LastEditors: tianyw
 */
import Vec3 from "./Vec3";

class Mat3 extends Float32Array {
  constructor() {
    super(9);
    this[0] = this[4] = this[8] = 1;
  } //Setup Identity

  static lookRotation(
    vDir: Vec3 | number[] | number | null | undefined,
    vUp: Vec3 | number[] | number | null | undefined,
    out: Mat3
  ) {
    const zAxis = new Vec3(vDir ? vDir : 0), //Forward
      up = new Vec3(vUp ? vUp : 0),
      xAxis = new Vec3(), //Right
      yAxis = new Vec3();

    zAxis.normalize();
    Vec3.cross(up, zAxis, xAxis);
    xAxis.normalize();
    Vec3.cross(zAxis, xAxis, yAxis); //new up

    const m00 = xAxis.x,
      m01 = xAxis.y,
      m02 = xAxis.z,
      m10 = yAxis.x,
      m11 = yAxis.y,
      m12 = yAxis.z,
      m20 = zAxis.x,
      m21 = zAxis.y,
      m22 = zAxis.z;

    out[0] = m00;
    out[1] = m01;
    out[2] = m02;
    out[3] = m10;
    out[4] = m11;
    out[5] = m12;
    out[6] = m20;
    out[7] = m21;
    out[8] = m22;
  }
}

export default Mat3;
