class Vec2 extends Float32Array {
  isModified:boolean;
  constructor(ini?: Vec2 | number[] | number) {
    super(2);

    if (ini instanceof Vec2) {
      this[0] = ini[0];
      this[1] = ini[1];
    } else if (ini && (ini as number[]).length === 2) {
      this[0] = (ini as number[])[0];
      this[1] = (ini as number[])[1];
    }
    // else if (arguments.length == 2) {
    //   this[0] = arguments[0];
    //   this[1] = arguments[1];
    // }
    else {
      this[0] = this[1] = (ini as number) || 0;
    }
    this.isModified = true;
  }

  //----------------------------------------------
  //Getters and Setters
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
  sete(x: number, y: number) {
    this[0] = x;
    this[1] = y;
    this.isModified = true;
    return this;
  }

  clone() {
    return new Vec2(this);
  }
  copy(v: Vec2) {
    this[0] = v[0];
    this[1] = v[1];
    return this;
  }

  fromAngleLen(ang: number, len: number) {
    this[0] = len * Math.cos(ang);
    this[1] = len * Math.sin(ang);
    return this;
  }

  getAngle(v?: Vec2) {
    if (v) {
      const x = v[0] - this[0],
        y = v[1] - this[1];
      return Math.atan2(y, x);
    }
    return Math.atan2(this[1], this[0]);
  }

  //When values are very small, like less then 0.000001, just make it zero.
  nearZero() {
    if (Math.abs(this[0]) <= 1e-6) this[0] = 0;
    if (Math.abs(this[1]) <= 1e-6) this[1] = 0;
    return this;
  }
  //endregion

  //----------------------------------------------
  // Methods
  lengthe(v?: Vec2) {
    //Only get the magnitude of this vector
    if (v === undefined || v === null)
      return Math.sqrt(this[0] * this[0] + this[1] * this[1]);

    //Get magnitude based on another vector
    const x = this[0] - v[0],
      y = this[1] - v[1];

    return Math.sqrt(x * x + y * y);
  }

  lengthSqr(v?: Vec2) {
    //Only get the squared magnitude of this vector
    if (v === undefined || v === null)
      return this[0] * this[0] + this[1] * this[1];

    //Get squared magnitude based on another vector
    const x = this[0] - v[0],
      y = this[1] - v[1];

    return x * x + y * y;
  }

  normalize(out?: Vec2) {
    const mag = Math.sqrt(this[0] * this[0] + this[1] * this[1]);
    if (mag === 0) return this;

    out = out || this;
    out[0] = this[0] / mag;
    out[1] = this[1] / mag;
    if(out === this) this.isModified = true;
    return out;
  }

  lerp(v: Vec2, t: number, out?: Vec2) {
    out = out || this;
    const tMin1 = 1 - t;

    //Linear Interpolation : (1 - t) * v0 + t * v1;
    out[0] = this[0] * tMin1 + v[0] * t;
    out[1] = this[1] * tMin1 + v[1] * t;
    if(out === this) this.isModified = true;
    return out;
  }

  rotate(ang: number, out?: Vec2) {
    out = out || this;

    const cos = Math.cos(ang),
      sin = Math.sin(ang),
      x = this[0],
      y = this[1];

    out[0] = x * cos - y * sin;
    out[1] = x * sin + y * cos;
    if(out === this) this.isModified = true;
    return out;
  }
  //endregion

  //----------------------------------------------
  // Math
  add(v: Vec2, out?: Vec2) {
    out = out || this;
    out[0] = this[0] + v[0];
    out[1] = this[1] + v[1];
    if(out === this) this.isModified = true;
    return out;
  }

  addXY(x: number, y: number, out?: Vec2) {
    out = out || this;
    out[0] = this[0] + x;
    out[1] = this[1] + y;
    return out;
  }

  sub(v: Vec2, out?: Vec2) {
    out = out || this;
    out[0] = this[0] - v[0];
    out[1] = this[1] - v[1];
    if(out === this) this.isModified = true;
    return out;
  }

  mul(v: Vec2, out?: Vec2) {
    out = out || this;
    out[0] = this[0] * v[0];
    out[1] = this[1] * v[1];
    if(out === this) this.isModified = true;
    return out;
  }

  div(v: Vec2, out?: Vec2) {
    out = out || this;
    out[0] = v[0] !== 0 ? this[0] / v[0] : 0;
    out[1] = v[1] !== 0 ? this[1] / v[1] : 0;
    if(out === this) this.isModified = true;
    return out;
  }

  scale(v: number, out?: Vec2) {
    out = out || this;
    out[0] = this[0] * v;
    out[1] = this[1] * v;
    if(out === this) this.isModified = true;
    return out;
  }

  divInvScale(v: number, out?: Vec2) {
    out = out || this;
    out[0] = this[0] !== 0 ? v / this[0] : 0;
    out[1] = this[1] !== 0 ? v / this[1] : 0;
    if(out === this) this.isModified = true;
    return out;
  }
  //endregion

  //----------------------------------------------
  //region Static
  static add(a: Vec2, b: Vec2, out?: Vec2) {
    out = out || new Vec2();
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    return out;
  }
  static sub(a: Vec2, b: Vec2, out?: Vec2) {
    out = out || new Vec2();
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    return out;
  }
  //endregion
}

export default Vec2;
