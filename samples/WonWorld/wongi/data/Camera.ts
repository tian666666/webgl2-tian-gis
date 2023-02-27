/*
 * @Description:
 * @Author: tianyw
 * @Date: 2023-02-21 21:36:33
 * @LastEditTime: 2023-02-27 21:14:57
 * @LastEditors: tianyw
 */
// import gl							from "../WonG.js";
// import fungi						from "../fungi.js";
// import Transform					from "../entities/Transform.js";
// import {Vec3, Mat4, Quat, Maths.DEG2RAD}	from "../Maths.js";

import WonG from "../gl";
import Transform from "./Transform";
import Maths, { Vec3, Mat4, Quat } from "../Maths";
import System from "../System";
import Ubo from "../Ubo";

class Camera extends Transform {
  projectionMatrix: Mat4;
  invertedProjectionMatrix: Mat4;
  invertedWorldMatrix: Mat4;
  constructor(fov: number = 45, near: number = 0.1, far: number = 100) {
    super();
    //Setup the projection and invert matrices
    this.projectionMatrix = new Mat4(16);
    this.invertedProjectionMatrix = new Mat4(16);
    this.invertedWorldMatrix = new Mat4(16);
  }
  setPerspective(fov = 45, near = 0.1, far = 100.0) {
    const ratio =
      (WonG.ctx as WebGL2RenderingContext).canvas.width /
      (WonG.ctx as WebGL2RenderingContext).canvas.height;
    Mat4.perspective(this.projectionMatrix, fov, ratio, near, far);
    Mat4.invert(this.invertedProjectionMatrix, this.projectionMatrix);
    return this;
  }
  setOrthographic(zoom = 1, near = -10, far = 100) {
    const w = 1 * zoom;
    const h =
      ((WonG.ctx as WebGL2RenderingContext).canvas.width /
        (WonG.ctx as WebGL2RenderingContext).canvas.height) *
      zoom;
    Mat4.ortho(this.projectionMatrix, -w, w, -history, h, near, far);
    Mat4.invert(this.invertedProjectionMatrix, this.projectionMatrix);
    return this;
  }
  updateMatrix(): boolean {
    const isUpdated = super.updateMatrix();
    if (isUpdated) {
      Mat4.invert(this.invertedWorldMatrix, this.worldMatrix);
    }
    return isUpdated;
  }
}

export default Camera;
