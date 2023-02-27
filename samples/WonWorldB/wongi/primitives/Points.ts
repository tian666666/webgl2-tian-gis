/*
 * @Description: 
 * @Author: tianyw
 * @Date: 2023-02-20 21:12:04
 * @LastEditTime: 2023-02-20 21:16:13
 * @LastEditors: tianyw
 */

import WonG from "../gl";
import Vao from "../Vao";
import Renderable from "../rendering/Renderable";
import DynamicBuffer from "../data/DynamicBuffer";
import { Vec3 } from "../Maths";
class Points extends Renderable {
  vertBuffer: DynamicBuffer;
  _hasChanged: boolean;
  constructor(name: string, startSize = 1, matName = "VecWColor") {
    super(name, null, matName);
    this.drawMode = (WonG.ctx as WebGL2RenderingContext).POINTS;
    this.vao = Vao.standardEmpty(name, 4, startSize);
    this.vertBuffer = DynamicBuffer.newFloat(
      this.vao.bVertices.id,
      4,
      startSize
    );
    this._hasChanged = false;
  }

  addRaw(x: number, y: number, z: number, w = 0) {
    this.vertBuffer.data.push(x, y, z, w);
    this._hasChanged = true;
    return this;
  }

  addVec(v: Vec3, w = 0) {
    this.vertBuffer.data.push(v[0], v[1], v[2], w);
    this._hasChanged = true;
    return this;
  }

  reset() {
    this.vertBuffer.data.splice(0);
    this.vao.elmCount = 0;
    this._hasChanged = true;
    return this;
  }

  update() {
    if (this._hasChanged) {
      this.vertBuffer.pushToGPU();
      this.vao.elmCount = this.vertBuffer.getComponentCnt();
      this._hasChanged = false;
    }
    return this;
  }
}

export default Points;
