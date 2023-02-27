class Vec3 extends Float32Array {
  static UP: Vec3 = new Vec3([0, 1, 0]);
  static LEFT: Vec3 = new Vec3([1, 0, 0]);
  static FORWARD: Vec3 = new Vec3([0, 0, 1]);
  isModified: boolean;
  constructor(ini?: Vec3 | number[] | number) {
    super(3);
    if (ini instanceof Vec3) {
      this[0] = ini[0];
      this[1] = ini[1];
      this[2] = ini[2];
    } else if (ini && (ini as number[]).length === 3) {
      this[0] = (ini as number[])[0];
      this[1] = (ini as number[])[1];
      this[2] = (ini as number[])[2];
    }
    // else if (arguments.length == 3) {
    // 传了 3 个参数
    //   this[0] = arguments[0];
    //   this[1] = arguments[1];
    //   this[2] = arguments[2];
    // }
    else {
      this[0] = this[1] = this[2] = (ini as number) || 0;
    }
    this.isModified = true;
  }

  //----------------------------------------------
  //region Getters and Setters
  sete(x: number, y: number, z: number) {
    this[0] = x;
    this[1] = y;
    this[2] = z;
    this.isModified = true;
    return this;
  }

  get x() {
    return this[0];
  }
  set x(val) {
    this[0] = val;
    this.isModified = true;
  }
  get y() {
    return this[1];
  }
  set y(val) {
    this[1] = val;
    this.isModified = true;
  }
  get z() {
    return this[2];
  }
  set z(val) {
    this[2] = val;
    this.isModified = true;
  }

  clone() {
    return new Vec3(this);
  }

  copy(v: Vec3) {
    this[0] = v[0];
    this[1] = v[1];
    this[2] = v[2];
    this.isModified = true;
    return this;
  }

  lengths(v?: Vec3) {
    //Only get the magnitude of this vector
    if (v === undefined || v === null)
      return Math.sqrt(
        this[0] * this[0] + this[1] * this[1] + this[2] * this[2]
      );

    //Get magnitude based on another vector
    const x = this[0] - v[0],
      y = this[1] - v[1],
      z = this[2] - v[2];

    return Math.sqrt(x * x + y * y + z * z);
  }

  lengthSqr(v: Vec3) {
    //Only get the squared magnitude of this vector
    if (v === undefined || v === null)
      return this[0] * this[0] + this[1] * this[1] + this[2] * this[2];

    //Get squared magnitude based on another vector
    const x = this[0] - v[0],
      y = this[1] - v[1],
      z = this[2] - v[2];

    return x * x + y * y + z * z;
  }

  //----------------------------------------------
  //region Methods
  magnitude(v?: Vec3) {
    //TODO Rename to Length in the future
    //Only get the magnitude of this vector
    if (v === undefined)
      return Math.sqrt(
        this[0] * this[0] + this[1] * this[1] + this[2] * this[2]
      );

    //Get magnitude based on another vector
    const x = this[0] - v[0],
      y = this[1] - v[1],
      z = this[2] - v[2];

    return Math.sqrt(x * x + y * y + z * z);
  }

  sqrMag(v?: Vec3) {
    //TODO Rename to LengthSqr
    //Only get the squared magnitude of this vector
    if (v === undefined)
      return this[0] * this[0] + this[1] * this[1] + this[2] * this[2];

    //Get squared magnitude based on another vector
    const x = this[0] - v[0],
      y = this[1] - v[1],
      z = this[2] - v[2];

    return x * x + y * y + z * z;
  }

  normalize(out?: Vec3) {
    const mag = Math.sqrt(
      this[0] * this[0] + this[1] * this[1] + this[2] * this[2]
    );
    if (mag === 0) return this;

    out = out || this;
    out[0] = this[0] / mag;
    out[1] = this[1] / mag;
    out[2] = this[2] / mag;
    if (out === this) this.isModified = true;
    return this;
  }

  //When values are very small, like less then 0.000001, just make it zero.
  nearZero(out?: Vec3) {
    out = out || this;

    if (Math.abs(out[0]) <= 1e-6) out[0] = 0;
    if (Math.abs(out[1]) <= 1e-6) out[1] = 0;
    if (Math.abs(out[2]) <= 1e-6) out[2] = 0;

    return this;
  }
  //endregion

  //----------------------------------------------
  //region Methods
  scale(v: number, out?: Vec3) {
    out = out || this;
    out[0] = this[0] * v;
    out[1] = this[1] * v;
    out[2] = this[2] * v;
    if (out === this) this.isModified = true;
    return this;
  }

  mul(v: Vec3, out?: Vec3) {
    out = out || this;
    out[0] = this[0] * v[0];
    out[1] = this[1] * v[1];
    out[2] = this[2] * v[2];
    if (out === this) this.isModified = true;
    return this;
  }

  add(v: Vec3, out?: Vec3) {
    out = out || this;
    out[0] = this[0] + v[0];
    out[1] = this[1] + v[1];
    out[2] = this[2] + v[2];
    if (out === this) this.isModified = true;
    return this;
  }

  sub(v: Vec3, out?: Vec3) {
    out = out || this;
    out[0] = this[0] - v[0];
    out[1] = this[1] - v[1];
    out[2] = this[2] - v[2];
    if (out === this) this.isModified = true;
    return this;
  }

  div(v: Vec3, out?: Vec3) {
    out = out || this;
    out[0] = v[0] !== 0 ? this[0] / v[0] : 0;
    out[1] = v[1] !== 0 ? this[1] / v[1] : 0;
    out[2] = v[2] !== 0 ? this[2] / v[2] : 0;
    if (out === this) this.isModified = true;
    return this;
  }

  divInvScale(v: number, out?: Vec3) {
    out = out || this;
    out[0] = this[0] !== 0 ? v / this[0] : 0;
    out[1] = this[1] !== 0 ? v / this[1] : 0;
    out[2] = this[2] !== 0 ? v / this[2] : 0;
    if (out === this) this.isModified = true;
    return this;
  }

  abs(out?: Vec3) {
    out = out || this;
    out[0] = Math.abs(this[0]);
    out[1] = Math.abs(this[1]);
    out[2] = Math.abs(this[2]);
    return this;
  }

  transformMat3(m: Float32Array, out?: Vec3) {
    const x = this[0],
      y = this[1],
      z = this[2];
    out = out || this;
    out[0] = x * m[0] + y * m[3] + z * m[6];
    out[1] = x * m[1] + y * m[4] + z * m[7];
    out[2] = x * m[2] + y * m[5] + z * m[8];
    return out;
  }

  transformMat4(m: Float32Array, out?: Vec3) {
    const x = this[0],
      y = this[1],
      z = this[2];
    let w = m[3] * x + m[7] * y + m[11] * z + m[15];
    w = w || 1.0;

    out = out || this;
    out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
    out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
    out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
    return out;
  }

  //https://www.siggraph.org/education/materials/HyperGraph/modeling/mod_tran/3drota.htm
  rotate(rad: number, axis = "x", out: Vec3 | null = null) {
    if (out === null) out = this;

    const sin = Math.sin(rad),
      cos = Math.cos(rad),
      x = this[0],
      y = this[1],
      z = this[2];

    switch (axis) {
      case "y": //..........................
        out[0] = z * sin + x * cos; //x
        out[2] = z * cos - x * sin; //z
        break;
      case "x": //..........................
        out[1] = y * cos - z * sin; //y
        out[2] = y * sin + z * cos; //z
        break;
      case "z": //..........................
        out[0] = x * cos - y * sin; //x
        out[1] = x * sin + y * cos; //y
        break;
    }

    return out;
  }

  lerp(v: Vec3, t: number, out?: Vec3) {
    out = out || this;
    const tMin1 = 1 - t;

    //Linear Interpolation : (1 - t) * v0 + t * v1;
    out[0] = this[0] * tMin1 + v[0] * t;
    out[1] = this[1] * tMin1 + v[1] * t;
    out[2] = this[2] * tMin1 + v[2] * t;
    return out;
  }

  static scalar(v: Vec3, s: number, out?: Vec3) {
    out = out || new Vec3();
    out[0] = v[0] * s;
    out[1] = v[1] * s;
    out[2] = v[2] * s;
    return out;
  }

  //endregion
  //----------------------------------------------
  //region Static
  static scalarRev(v: Vec3, s: number, out?: Vec3) {
    //TODO, Is this even needed?
    out = out || new Vec3();
    out[0] = s * v[0];
    out[1] = s * v[1];
    out[2] = s * v[2];
    return out;
  }

  static add(a: Vec3, b: Vec3) {
    return new Vec3([a[0] + b[0], a[1] + b[1], a[2] + b[2]]);
  }
  static sub(a: Vec3, b: Vec3, out?: Vec3) {
    out = out || new Vec3();
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    return out;
  }
  static mul(a: Vec3, b: Vec3, out?: Vec3) {
    out = out || new Vec3();
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];
    return out;
  }
  static div(a: Vec3, b: Vec3, out?: Vec3) {
    out = out || new Vec3();
    out[0] = b[0] !== 0 ? a[0] / b[0] : 0;
    out[1] = b[1] !== 0 ? a[1] / b[1] : 0;
    out[2] = b[2] !== 0 ? a[2] / b[2] : 0;
    return out;
  }
  static scale(v: Vec3, s: number, out?: Vec3) {
    out = out || new Vec3();
    out[0] = v[0] * s;
    out[1] = v[1] * s;
    out[2] = v[2] * s;
    return out;
  }
  static abs(v: Vec3, out?: Vec3) {
    out = out || new Vec3();
    out[0] = Math.abs(v[0]);
    out[1] = Math.abs(v[1]);
    out[2] = Math.abs(v[2]);
    return out;
  }

  static norm(v: Vec3, out?: Vec3) {
    let mag = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    if (mag === 0) return null;
    out = out || new Vec3();

    mag = 1 / mag;
    out[0] = v[0] * mag;
    out[1] = v[1] * mag;
    out[2] = v[2] * mag;
    return out;
  }

  static dot(a: Vec3, b: Vec3) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }
  static cross(a: Vec3, b: Vec3, out?: Vec3) {
    const ax = a[0],
      ay = a[1],
      az = a[2],
      bx = b[0],
      by = b[1],
      bz = b[2];

    out = out || new Vec3();
    out[0] = ay * bz - az * by;
    out[1] = az * bx - ax * bz;
    out[2] = ax * by - ay * bx;
    return out;
  }

  static lerp(a: Vec3, b: Vec3, t: number, out?: Vec3) {
    out = out || new Vec3();
    let ax = a[0],
      ay = a[1],
      az = a[2];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    out[2] = az + t * (b[2] - az);
    return out;
  }

  //Another Equation for Linear Interpolation : (1 - t) * v0 + t * v1;
  //Todo, see if this one work better then whats there.
  /*
		static lerp(a, b, t, out){
			out = out || new Vec3();

			let ax = a[0],
				ay = a[1],
				az = a[2],
				tMin1 = 1 - t;

			out[0] = tMin1 * ax + t * b[0];
			out[1] = tMin1 * ay + t * b[1];
			out[2] = tMin1 * az + t * b[2];
			return out;
		}
		*/

  //endregion
}

export default Vec3;
