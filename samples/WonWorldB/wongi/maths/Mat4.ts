import { Quat } from "../Maths";
import Mat3 from "./Mat3";
import Vec3 from "./Vec3";

class Matrix4 extends Float32Array {
  constructor(len: number = 16) {
    super(len);
    this[0] = this[5] = this[10] = this[15] = 1;
  } //Setup Identity

  //----------------------------------------------
  //region Methods
  translate(ary: Vec3) {
    Matrix4.translate(this, ary[0], ary[1], ary[2]);
    return this;
  }
  resetTranslation() {
    this[12] = this[13] = this[14] = 0;
    this[15] = 1;
    return this;
  }

  //reset data back to identity.
  reset() {
    for (let i = 0; i <= this.length; i++) this[i] = i % 5 === 0 ? 1 : 0; //only positions 0,5,10,15 need to be 1 else 0
    return this;
  }

  //copy another matrix's data to this one.
  copy(mat: Matrix4) {
    for (let i = 0; i < 16; i++) this[i] = mat[i];
    return this;
  }
  //endregion

  //----------------------------------------------
  //region Static
  static identity(out: Matrix4) {
    for (let i = 0; i <= out.length; i++) out[i] = i % 5 === 0 ? 1 : 0; //only positions 0,5,10,15 need to be 1 else 0
  }

  static perspective(
    out: Matrix4,
    fovy: number,
    aspect: number,
    near: number,
    far: number
  ) {
    const f = 1.0 / Math.tan(fovy / 2),
      nf = 1 / (near - far);
    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = 2 * far * near * nf;
    out[15] = 0;
  }

  static ortho(
    out: Matrix4,
    left: number,
    right: number,
    bottom: number,
    top: number,
    near: number,
    far: number
  ) {
    const lr = 1 / (left - right),
      bt = 1 / (bottom - top),
      nf = 1 / (near - far);
    out[0] = -2 * lr;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = -2 * bt;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 2 * nf;
    out[11] = 0;
    out[12] = (left + right) * lr;
    out[13] = (top + bottom) * bt;
    out[14] = (far + near) * nf;
    out[15] = 1;
  }

  //make the rows into the columns
  static transpose(out: Matrix4, a: Matrix4) {
    //If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
      const a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a12 = a[6],
        a13 = a[7],
        a23 = a[11];
      out[1] = a[4];
      out[2] = a[8];
      out[3] = a[12];
      out[4] = a01;
      out[6] = a[9];
      out[7] = a[13];
      out[8] = a02;
      out[9] = a12;
      out[11] = a[14];
      out[12] = a03;
      out[13] = a13;
      out[14] = a23;
    } else {
      out[0] = a[0];
      out[1] = a[4];
      out[2] = a[8];
      out[3] = a[12];
      out[4] = a[1];
      out[5] = a[5];
      out[6] = a[9];
      out[7] = a[13];
      out[8] = a[2];
      out[9] = a[6];
      out[10] = a[10];
      out[11] = a[14];
      out[12] = a[3];
      out[13] = a[7];
      out[14] = a[11];
      out[15] = a[15];
    }

    return out;
  }

  //Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix
  static normalMat3(out: Mat3, a: Matrix4) {
    const a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3],
      a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7],
      a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11],
      a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15],
      b00 = a00 * a11 - a01 * a10,
      b01 = a00 * a12 - a02 * a10,
      b02 = a00 * a13 - a03 * a10,
      b03 = a01 * a12 - a02 * a11,
      b04 = a01 * a13 - a03 * a11,
      b05 = a02 * a13 - a03 * a12,
      b06 = a20 * a31 - a21 * a30,
      b07 = a20 * a32 - a22 * a30,
      b08 = a20 * a33 - a23 * a30,
      b09 = a21 * a32 - a22 * a31,
      b10 = a21 * a33 - a23 * a31,
      b11 = a22 * a33 - a23 * a32;

    // Calculate the determinant
    let det =
      b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) return null;

    det = 1.0 / det;

    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;

    out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;

    out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    return out;
  }

  //New function derived from fromRotationTranslation, just took out the translation stuff.
  static fromQuaternion(out: Matrix4, q: Quat) {
    // Quaternion math
    const x = q[0],
      y = q[1],
      z = q[2],
      w = q[3],
      x2 = x + x,
      y2 = y + y,
      z2 = z + z,
      xx = x * x2,
      xy = x * y2,
      xz = x * z2,
      yy = y * y2,
      yz = y * z2,
      zz = z * z2,
      wx = w * x2,
      wy = w * y2,
      wz = w * z2;

    out[0] = 1 - (yy + zz);
    out[1] = xy + wz;
    out[2] = xz - wy;
    out[3] = 0;
    out[4] = xy - wz;
    out[5] = 1 - (xx + zz);
    out[6] = yz + wx;
    out[7] = 0;
    out[8] = xz + wy;
    out[9] = yz - wx;
    out[10] = 1 - (xx + yy);
    out[11] = 0;
    return out;
  }

  //https://github.com/toji/gl-matrix/blob/master/src/gl-matrix/mat4.js
  static fromQuaternionTranslation(out: Matrix4, q: number[], v: number[]) {
    // Quaternion math
    const x = q[0],
      y = q[1],
      z = q[2],
      w = q[3],
      x2 = x + x,
      y2 = y + y,
      z2 = z + z,
      xx = x * x2,
      xy = x * y2,
      xz = x * z2,
      yy = y * y2,
      yz = y * z2,
      zz = z * z2,
      wx = w * x2,
      wy = w * y2,
      wz = w * z2;

    out[0] = 1 - (yy + zz);
    out[1] = xy + wz;
    out[2] = xz - wy;
    out[3] = 0;
    out[4] = xy - wz;
    out[5] = 1 - (xx + zz);
    out[6] = yz + wx;
    out[7] = 0;
    out[8] = xz + wy;
    out[9] = yz - wx;
    out[10] = 1 - (xx + yy);
    out[11] = 0;
    out[12] = v[0];
    out[13] = v[1];
    out[14] = v[2];
    out[15] = 1;
    return out;
  }

  static fromQuaternionTranslationScale(
    out: Matrix4,
    q: Quat,
    v: Vec3,
    s: Vec3
  ) {
    // Quaternion math
    const x = q[0],
      y = q[1],
      z = q[2],
      w = q[3],
      x2 = x + x,
      y2 = y + y,
      z2 = z + z,
      xx = x * x2,
      xy = x * y2,
      xz = x * z2,
      yy = y * y2,
      yz = y * z2,
      zz = z * z2,
      wx = w * x2,
      wy = w * y2,
      wz = w * z2,
      sx = s[0],
      sy = s[1],
      sz = s[2];

    out[0] = (1 - (yy + zz)) * sx;
    out[1] = (xy + wz) * sx;
    out[2] = (xz - wy) * sx;
    out[3] = 0;
    out[4] = (xy - wz) * sy;
    out[5] = (1 - (xx + zz)) * sy;
    out[6] = (yz + wx) * sy;
    out[7] = 0;
    out[8] = (xz + wy) * sz;
    out[9] = (yz - wx) * sz;
    out[10] = (1 - (xx + yy)) * sz;
    out[11] = 0;
    out[12] = v[0];
    out[13] = v[1];
    out[14] = v[2];
    out[15] = 1;

    return out;
  }

  static getTranslation(out: Matrix4, mat: Matrix4) {
    out[0] = mat[12];
    out[1] = mat[13];
    out[2] = mat[14];
    return out;
  }

  static getScaling(out: number[], mat: Matrix4) {
    const m11 = mat[0],
      m12 = mat[1],
      m13 = mat[2],
      m21 = mat[4],
      m22 = mat[5],
      m23 = mat[6],
      m31 = mat[8],
      m32 = mat[9],
      m33 = mat[10];
    out[0] = Math.sqrt(m11 * m11 + m12 * m12 + m13 * m13);
    out[1] = Math.sqrt(m21 * m21 + m22 * m22 + m23 * m23);
    out[2] = Math.sqrt(m31 * m31 + m32 * m32 + m33 * m33);
    return out;
  }

  //Returns a quaternion representing the rotational component of a transformation matrix. If a matrix is built with
  //fromRotationTranslation, the returned quaternion will be the same as the quaternion originally supplied
  static getRotation(out: number[], mat: Matrix4) {
    // Algorithm taken from http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm
    const trace = mat[0] + mat[5] + mat[10];
    let S = 0;

    if (trace > 0) {
      S = Math.sqrt(trace + 1.0) * 2;
      out[3] = 0.25 * S;
      out[0] = (mat[6] - mat[9]) / S;
      out[1] = (mat[8] - mat[2]) / S;
      out[2] = (mat[1] - mat[4]) / S;
    } else if (mat[0] > mat[5] && mat[0] > mat[10]) {
      S = Math.sqrt(1.0 + mat[0] - mat[5] - mat[10]) * 2;
      out[3] = (mat[6] - mat[9]) / S;
      out[0] = 0.25 * S;
      out[1] = (mat[1] + mat[4]) / S;
      out[2] = (mat[8] + mat[2]) / S;
    } else if (mat[5] > mat[10]) {
      S = Math.sqrt(1.0 + mat[5] - mat[0] - mat[10]) * 2;
      out[3] = (mat[8] - mat[2]) / S;
      out[0] = (mat[1] + mat[4]) / S;
      out[1] = 0.25 * S;
      out[2] = (mat[6] + mat[9]) / S;
    } else {
      S = Math.sqrt(1.0 + mat[10] - mat[0] - mat[5]) * 2;
      out[3] = (mat[1] - mat[4]) / S;
      out[0] = (mat[8] + mat[2]) / S;
      out[1] = (mat[6] + mat[9]) / S;
      out[2] = 0.25 * S;
    }
    return out;
  }

  //....................................................................
  //Static Operation

  //https://github.com/gregtatum/mdn-model-view-projection/blob/master/shared/matrices.js
  static multiplyVector(mat4: Matrix4, v: number[]) {
    //TODO: Dont need this, transformVec3 does a better job.
    const x = v[0],
      y = v[1],
      z = v[2],
      w = v[3];
    const c1r1 = mat4[0],
      c2r1 = mat4[1],
      c3r1 = mat4[2],
      c4r1 = mat4[3],
      c1r2 = mat4[4],
      c2r2 = mat4[5],
      c3r2 = mat4[6],
      c4r2 = mat4[7],
      c1r3 = mat4[8],
      c2r3 = mat4[9],
      c3r3 = mat4[10],
      c4r3 = mat4[11],
      c1r4 = mat4[12],
      c2r4 = mat4[13],
      c3r4 = mat4[14],
      c4r4 = mat4[15];

    return [
      x * c1r1 + y * c1r2 + z * c1r3 + w * c1r4,
      x * c2r1 + y * c2r2 + z * c2r3 + w * c2r4,
      x * c3r1 + y * c3r2 + z * c3r3 + w * c3r4,
      x * c4r1 + y * c4r2 + z * c4r3 + w * c4r4
    ];
  }

  //https://github.com/toji/gl-matrix/blob/master/src/gl-matrix/vec4.js, vec4.transformMat4
  static transformVec4(out: number[], v: number[], m: Matrix4) {
    out[0] = m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12] * v[3];
    out[1] = m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13] * v[3];
    out[2] = m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14] * v[3];
    out[3] = m[3] * v[0] + m[7] * v[1] + m[11] * v[2] + m[15] * v[3];
    return out;
  }

  static transformVec3(out: number[], v: Vec3, m: Matrix4) {
    out[0] = m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12];
    out[1] = m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13];
    out[2] = m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14];
    out[3] = m[3] * v[0] + m[7] * v[1] + m[11] * v[2] + m[15];
    return out;
  }

  //From glMatrix
  //Multiple two mat4 together
  static mult(out: Matrix4, a: Matrix4, b: Matrix4) {
    const a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3],
      a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7],
      a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11],
      a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15];

    // Cache only the current line of the second matrix
    let b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3];
    out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b[4];
    b1 = b[5];
    b2 = b[6];
    b3 = b[7];
    out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b[8];
    b1 = b[9];
    b2 = b[10];
    b3 = b[11];
    out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b[12];
    b1 = b[13];
    b2 = b[14];
    b3 = b[15];
    out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    return out;
  }

  //....................................................................
  //Static Transformation
  static scale(out: Matrix4, x: number, y: number, z: number) {
    out[0] *= x;
    out[1] *= x;
    out[2] *= x;
    out[3] *= x;
    out[4] *= y;
    out[5] *= y;
    out[6] *= y;
    out[7] *= y;
    out[8] *= z;
    out[9] *= z;
    out[10] *= z;
    out[11] *= z;
    return out;
  }

  static rotateY(out: Matrix4, rad: number) {
    const s = Math.sin(rad),
      c = Math.cos(rad),
      a00 = out[0],
      a01 = out[1],
      a02 = out[2],
      a03 = out[3],
      a20 = out[8],
      a21 = out[9],
      a22 = out[10],
      a23 = out[11];

    // Perform axis-specific matrix multiplication
    out[0] = a00 * c - a20 * s;
    out[1] = a01 * c - a21 * s;
    out[2] = a02 * c - a22 * s;
    out[3] = a03 * c - a23 * s;
    out[8] = a00 * s + a20 * c;
    out[9] = a01 * s + a21 * c;
    out[10] = a02 * s + a22 * c;
    out[11] = a03 * s + a23 * c;
    return out;
  }

  static rotateX(out: Matrix4, rad: number) {
    const s = Math.sin(rad),
      c = Math.cos(rad),
      a10 = out[4],
      a11 = out[5],
      a12 = out[6],
      a13 = out[7],
      a20 = out[8],
      a21 = out[9],
      a22 = out[10],
      a23 = out[11];

    // Perform axis-specific matrix multiplication
    out[4] = a10 * c + a20 * s;
    out[5] = a11 * c + a21 * s;
    out[6] = a12 * c + a22 * s;
    out[7] = a13 * c + a23 * s;
    out[8] = a20 * c - a10 * s;
    out[9] = a21 * c - a11 * s;
    out[10] = a22 * c - a12 * s;
    out[11] = a23 * c - a13 * s;
    return out;
  }

  static rotateZ(out: Matrix4, rad: number) {
    const s = Math.sin(rad),
      c = Math.cos(rad),
      a00 = out[0],
      a01 = out[1],
      a02 = out[2],
      a03 = out[3],
      a10 = out[4],
      a11 = out[5],
      a12 = out[6],
      a13 = out[7];

    // Perform axis-specific matrix multiplication
    out[0] = a00 * c + a10 * s;
    out[1] = a01 * c + a11 * s;
    out[2] = a02 * c + a12 * s;
    out[3] = a03 * c + a13 * s;
    out[4] = a10 * c - a00 * s;
    out[5] = a11 * c - a01 * s;
    out[6] = a12 * c - a02 * s;
    out[7] = a13 * c - a03 * s;
    return out;
  }

  static rotate(out: Matrix4, rad: number, axis: number[]) {
    let x = axis[0],
      y = axis[1],
      z = axis[2],
      len = Math.sqrt(x * x + y * y + z * z),
      s,
      c,
      t,
      a00,
      a01,
      a02,
      a03,
      a10,
      a11,
      a12,
      a13,
      a20,
      a21,
      a22,
      a23,
      b00,
      b01,
      b02,
      b10,
      b11,
      b12,
      b20,
      b21,
      b22;

    if (Math.abs(len) < 0.000001) {
      return null;
    }

    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;

    s = Math.sin(rad);
    c = Math.cos(rad);
    t = 1 - c;

    a00 = out[0];
    a01 = out[1];
    a02 = out[2];
    a03 = out[3];
    a10 = out[4];
    a11 = out[5];
    a12 = out[6];
    a13 = out[7];
    a20 = out[8];
    a21 = out[9];
    a22 = out[10];
    a23 = out[11];

    // Construct the elements of the rotation matrix
    b00 = x * x * t + c;
    b01 = y * x * t + z * s;
    b02 = z * x * t - y * s;
    b10 = x * y * t - z * s;
    b11 = y * y * t + c;
    b12 = z * y * t + x * s;
    b20 = x * z * t + y * s;
    b21 = y * z * t - x * s;
    b22 = z * z * t + c;

    // Perform rotation-specific matrix multiplication
    out[0] = a00 * b00 + a10 * b01 + a20 * b02;
    out[1] = a01 * b00 + a11 * b01 + a21 * b02;
    out[2] = a02 * b00 + a12 * b01 + a22 * b02;
    out[3] = a03 * b00 + a13 * b01 + a23 * b02;
    out[4] = a00 * b10 + a10 * b11 + a20 * b12;
    out[5] = a01 * b10 + a11 * b11 + a21 * b12;
    out[6] = a02 * b10 + a12 * b11 + a22 * b12;
    out[7] = a03 * b10 + a13 * b11 + a23 * b12;
    out[8] = a00 * b20 + a10 * b21 + a20 * b22;
    out[9] = a01 * b20 + a11 * b21 + a21 * b22;
    out[10] = a02 * b20 + a12 * b21 + a22 * b22;
    out[11] = a03 * b20 + a13 * b21 + a23 * b22;
  }

  static invert(out: Matrix4, mat?: Matrix4) {
    if (mat === undefined || mat === null) mat = out; //If input isn't sent, then output is also input

    const a00 = mat[0],
      a01 = mat[1],
      a02 = mat[2],
      a03 = mat[3],
      a10 = mat[4],
      a11 = mat[5],
      a12 = mat[6],
      a13 = mat[7],
      a20 = mat[8],
      a21 = mat[9],
      a22 = mat[10],
      a23 = mat[11],
      a30 = mat[12],
      a31 = mat[13],
      a32 = mat[14],
      a33 = mat[15],
      b00 = a00 * a11 - a01 * a10,
      b01 = a00 * a12 - a02 * a10,
      b02 = a00 * a13 - a03 * a10,
      b03 = a01 * a12 - a02 * a11,
      b04 = a01 * a13 - a03 * a11,
      b05 = a02 * a13 - a03 * a12,
      b06 = a20 * a31 - a21 * a30,
      b07 = a20 * a32 - a22 * a30,
      b08 = a20 * a33 - a23 * a30,
      b09 = a21 * a32 - a22 * a31,
      b10 = a21 * a33 - a23 * a31,
      b11 = a22 * a33 - a23 * a32;
    // Calculate the determinant
    let det =
      b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) return false;
    det = 1.0 / det;

    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

    return true;
  }

  //https://github.com/toji/gl-matrix/blob/master/src/gl-matrix/mat4.js  mat4.scalar.translate = function (out, a, v) {
  static translate(out: Matrix4, x: number, y: number, z: number) {
    out[12] = out[0] * x + out[4] * y + out[8] * z + out[12];
    out[13] = out[1] * x + out[5] * y + out[9] * z + out[13];
    out[14] = out[2] * x + out[6] * y + out[10] * z + out[14];
    out[15] = out[3] * x + out[7] * y + out[11] * z + out[15];
  }
  //endregion
}

export default Matrix4;
