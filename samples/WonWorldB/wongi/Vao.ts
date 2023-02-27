import Shader from "./Shader";
import WonG from "./gl";
import { Wongi } from "./Wongi";

class Vao {
  vao: any;
  constructor() {
    this.vao = null;
  }

  //----------------------------------------------------------
  create() {
    this.vao = {
      id: (WonG.ctx as WebGL2RenderingContext).createVertexArray(),
      elmCount: 0,
      isIndexed: false,
      isInstanced: false
    };

    //vao.instanceCount - Added dynamicly if needed.

    (WonG.ctx as WebGL2RenderingContext).bindVertexArray(this.vao.id);
    return this;
  }

  finalize(name: string) {
    if (this.vao.elmCount === 0 && this.vao.bVertices !== undefined)
      this.vao.elmCount = this.vao.bVertices.elmCount;
    if (!WonG.ctx) return this.vao;
    WonG.ctx.bindVertexArray(null);
    WonG.ctx.bindBuffer(WonG.ctx.ARRAY_BUFFER, null);
    WonG.ctx.bindBuffer(WonG.ctx.ELEMENT_ARRAY_BUFFER, null);

    Wongi.vaos.set(name, this.vao);
    return this.vao;
  }

  setInstanced(cnt: number) {
    this.vao.isInstanced = true;
    this.vao.instanceCount = cnt;
    return this;
  }

  cleanup() {
    this.vao = null;
    return this;
  }
  //endregion

  //----------------------------------------------------------
  //Float Array Buffers
  floatBuffer(
    name: string,
    aryData: Float32Array | number[],
    attrLoc: number,
    compLen = 3,
    stride = 0,
    offset = 0,
    isStatic = true,
    isInstance = false
  ) {
    if (!WonG.ctx) return this;
    const rtn = {
      id: WonG.ctx.createBuffer(),
      compLen: compLen,
      stride: stride,
      offset: offset,
      elmCount: aryData.length / compLen
    };

    const ary =
      aryData instanceof Float32Array ? aryData : new Float32Array(aryData);

    WonG.ctx.bindBuffer(WonG.ctx.ARRAY_BUFFER, rtn.id);
    WonG.ctx.bufferData(
      WonG.ctx.ARRAY_BUFFER,
      ary,
      isStatic ? WonG.ctx.STATIC_DRAW : WonG.ctx.DYNAMIC_DRAW
    );
    WonG.ctx.enableVertexAttribArray(attrLoc);
    WonG.ctx.vertexAttribPointer(
      attrLoc,
      compLen,
      WonG.ctx.FLOAT,
      false,
      stride,
      offset
    );

    if (isInstance === true) WonG.ctx.vertexAttribDivisor(attrLoc, 1);

    this.vao[name] = rtn;
    return this;
  }

  partitionFloatBuffer(
    attrLoc: number,
    compLen: number,
    stride = 0,
    offset = 0,
    isInstance = false
  ) {
    if (!WonG.ctx) return;
    WonG.ctx.enableVertexAttribArray(attrLoc);
    WonG.ctx.vertexAttribPointer(
      attrLoc,
      compLen,
      WonG.ctx.FLOAT,
      false,
      stride,
      offset
    );

    if (isInstance) WonG.ctx.vertexAttribDivisor(attrLoc, 1);

    return this;
  }

  emptyFloatBuffer(
    name: string,
    byteCount: number,
    attrLoc: number,
    compLen: number,
    stride = 0,
    offset = 0,
    isStatic = false,
    isInstance = false
  ) {
    if (!WonG.ctx) return this;
    const rtn = {
      id: WonG.ctx.createBuffer(),
      compLen: compLen,
      stride: stride,
      offset: offset,
      elmCount: 0
    };

    WonG.ctx.bindBuffer(WonG.ctx.ARRAY_BUFFER, rtn.id);
    WonG.ctx.bufferData(
      WonG.ctx.ARRAY_BUFFER,
      byteCount,
      isStatic ? WonG.ctx.STATIC_DRAW : WonG.ctx.DYNAMIC_DRAW
    );
    WonG.ctx.enableVertexAttribArray(attrLoc);
    WonG.ctx.vertexAttribPointer(
      attrLoc,
      compLen,
      WonG.ctx.FLOAT,
      false,
      stride,
      offset
    );

    if (isInstance) WonG.ctx.vertexAttribDivisor(attrLoc, 1);

    this.vao[name] = rtn;
    return this;
  }
  //endregion

  //----------------------------------------------------------
  //Matrix 4 Array Buffer
  //   mat4ArrayBuffer(name:number, aryData, attrLoc, isStatic = true, isInstance = false) {
  //     var rtn = {
  //       id: WonG.ctx.createBuffer(),
  //       compLen: 4,
  //       stride: 64,
  //       offset: 0,
  //       elmCount: aryFloat.length / 16
  //     };

  //     var ary =
  //       aryData instanceof Float32Array ? aryData : new Float32Array(aryData);

  //     WonG.ctx.bindBuffer(WonG.ctx.ARRAY_BUFFER, rtn.id);
  //     WonG.ctx.bufferData(
  //       WonG.ctx.ARRAY_BUFFER,
  //       ary,
  //       isStatic != false ? WonG.ctx.STATIC_DRAW : WonG.ctx.DYNAMIC_DRAW
  //     );

  //     //Matrix is treated like an array of vec4, So there is actually 4 attributes to setup that
  //     //actually makes up a single mat4.
  //     WonG.ctx.enableVertexAttribArray(attrLoc);
  //     WonG.ctx.vertexAttribPointer(attrLoc, 4, WonG.ctx.FLOAT, false, 64, 0);

  //     WonG.ctx.enableVertexAttribArray(attrLoc + 1);
  //     WonG.ctx.vertexAttribPointer(attrLoc + 1, 4, WonG.ctx.FLOAT, false, 64, 16);

  //     WonG.ctx.enableVertexAttribArray(attrLoc + 2);
  //     WonG.ctx.vertexAttribPointer(attrLoc + 2, 4, WonG.ctx.FLOAT, false, 64, 32);

  //     WonG.ctx.enableVertexAttribArray(attrLoc + 3);
  //     WonG.ctx.vertexAttribPointer(attrLoc + 3, 4, WonG.ctx.FLOAT, false, 64, 48);

  //     if (isInstance) {
  //       WonG.ctx.vertexAttribDivisor(attrLoc, 1);
  //       WonG.ctx.vertexAttribDivisor(attrLoc + 1, 1);
  //       WonG.ctx.vertexAttribDivisor(attrLoc + 2, 1);
  //       WonG.ctx.vertexAttribDivisor(attrLoc + 3, 1);
  //     }

  //     this.vao[name] = rtn;
  //     return this;
  //   }
  //endregion

  //----------------------------------------------------------
  //Indexes
  indexBuffer(name: string, aryData: Uint16Array | number[], isStatic = true) {
    if (!WonG.ctx) return this;
    const rtn = { id: WonG.ctx.createBuffer(), elmCount: aryData.length },
      ary = aryData instanceof Uint16Array ? aryData : new Uint16Array(aryData);

    WonG.ctx.bindBuffer(WonG.ctx.ELEMENT_ARRAY_BUFFER, rtn.id);
    WonG.ctx.bufferData(
      WonG.ctx.ELEMENT_ARRAY_BUFFER,
      ary,
      isStatic ? WonG.ctx.STATIC_DRAW : WonG.ctx.DYNAMIC_DRAW
    );

    this.vao[name] = rtn;
    this.vao.elmCount = aryData.length;
    this.vao.isIndexed = true;
    return this;
  }

  emptyIndexBuffer(name: string, byteCount: number, isStatic = false) {
    if (!WonG.ctx) return this;
    const rtn = { id: WonG.ctx.createBuffer(), elmCount: 0 };

    WonG.ctx.bindBuffer(WonG.ctx.ELEMENT_ARRAY_BUFFER, rtn.id);
    WonG.ctx.bufferData(
      WonG.ctx.ELEMENT_ARRAY_BUFFER,
      byteCount,
      isStatic ? WonG.ctx.STATIC_DRAW : WonG.ctx.DYNAMIC_DRAW
    );

    this.vao[name] = rtn;
    this.vao.isIndexed = true;
    return this;
  }
  //endregion

  //----------------------------------------------------------
  //Static Functions
  static bind(vao: any) {
    (WonG.ctx as WebGL2RenderingContext).bindVertexArray(vao.id);
    return Vao;
  }
  static unbind() {
    (WonG.ctx as WebGL2RenderingContext).bindVertexArray(null);
    return Vao;
  }
  static draw(
    vao: any,
    drawMode = (WonG.ctx as WebGL2RenderingContext).TRIANGLES,
    doBinding = false
  ) {
    if (!WonG.ctx) return Vao;
    if (doBinding) WonG.ctx.bindVertexArray(vao.id);

    if (vao.elmCount !== 0) {
      if (vao.isIndexed)
        WonG.ctx.drawElements(
          drawMode,
          vao.elmCount,
          WonG.ctx.UNSIGNED_SHORT,
          0
        );
      else WonG.ctx.drawArrays(drawMode, 0, vao.elmCount);
    }

    if (doBinding) WonG.ctx.bindVertexArray(null);
    return Vao;
  }

  //static updateAryBufSubData(bufID, offset, data){
  //	WonG.ctx.bindBuffer(WonG.ctx.ARRAY_BUFFER, bufID);
  //	WonG.ctx.bufferSubData(WonG.ctx.ARRAY_BUFFER, offset, data, 0, null);
  //	WonG.ctx.bindBuffer(WonG.ctx.ARRAY_BUFFER, null);
  //}
  //endregion

  //----------------------------------------------------------
  //Templates
  static standardRenderable(
    name: string,
    vertCompLen: number,
    aryVert: Float32Array | number[],
    aryNorm?: number[] | Float32Array,
    aryUV?: Float32Array | number[],
    aryInd?: number[] | Uint16Array
  ) {
    const o = new Vao()
      .create()
      .floatBuffer(
        "bVertices",
        aryVert,
        Shader.ATTRIB_POSITION_LOC,
        vertCompLen
      );

    if (aryNorm) o.floatBuffer("bNormal", aryNorm, Shader.ATTRIB_NORMAL_LOC, 3);
    if (aryUV) o.floatBuffer("bUV", aryUV, Shader.ATTRIB_UV_LOC, 2);
    if (aryInd) o.indexBuffer("bIndex", aryInd);

    const vao = o.finalize(name);
    o.cleanup();

    return vao;
  }

  static standardArmature(
    name: string,
    vertCompLen: number,
    aryVert: Float32Array | number[],
    aryNorm: Float32Array | number[] | null = null,
    aryUV: Float32Array | number[] | null = null,
    aryInd: Uint16Array | number[] | null = null,
    jointSize = 0,
    aryJoint: Float32Array | number[] | null = null,
    aryWeight: Float32Array | number[] | null = null
  ) {
    const o = new Vao()
      .create()
      .floatBuffer(
        "bVertices",
        aryVert,
        Shader.ATTRIB_POSITION_LOC,
        vertCompLen
      );

    if (aryNorm) o.floatBuffer("bNormal", aryNorm, Shader.ATTRIB_NORMAL_LOC, 3);
    if (aryUV) o.floatBuffer("bUV", aryUV, Shader.ATTRIB_UV_LOC, 2);
    if (aryInd) o.indexBuffer("bIndex", aryInd);
    if (jointSize > 0) {
      if (aryJoint) {
        o.floatBuffer(
          "bJointIdx",
          aryJoint,
          Shader.ATTRIB_JOINT_IDX_LOC,
          jointSize
        );
      }
      if (aryWeight) {
        o.floatBuffer(
          "bJointWeight",
          aryWeight,
          Shader.ATTRIB_JOINT_WEIGHT_LOC,
          jointSize
        );
      }
    }

    const vao = o.finalize(name);
    o.cleanup();

    return vao;
  }

  static standardEmpty(
    name: string,
    vertCompLen = 3,
    vertCnt = 4,
    normLen: number = 0,
    uvLen: number = 0,
    indexLen: number = 0
  ) {
    const o = new Vao()
      .create()
      .emptyFloatBuffer(
        "bVertices",
        Float32Array.BYTES_PER_ELEMENT * vertCompLen * vertCnt,
        Shader.ATTRIB_POSITION_LOC,
        vertCompLen
      );

    //if(aryNorm)	VAO.floatArrayBuffer(rtn,	"bNormal",	aryNorm,	ATTR_NORM_LOC,	3,0,0,true);
    //if(aryUV)	VAO.floatArrayBuffer(rtn,	"bUV",		aryUV,		ATTR_UV_LOC,	2,0,0,true);
    if (indexLen > 0)
      o.emptyIndexBuffer(
        "bIndex",
        Uint16Array.BYTES_PER_ELEMENT * indexLen,
        false
      );

    const vao = o.finalize(name);
    o.cleanup();

    return vao;
  }
  //endregion
}

export default Vao;
